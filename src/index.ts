import * as core from '@actions/core'
import * as buildevents from './buildevents.js'
import * as util from './util.js'

async function run(): Promise<void> {
  try {
    // to enable debug logging, add a secret named ACTIONS_RUNNER_DEBUG with the value 'true'
    core.debug('Environment variables:')
    for (const key in process.env) {
      core.debug(`- ${key} = ${process.env[key]}`)
    }

    const buildStart = util.getTimestamp()
    const traceId = generateTraceId()

    core.info(`Trace ID: ${traceId}`)

    const apikey = core.getInput('apikey', { required: true })
    core.setSecret(apikey)
    const dataset = core.getInput('dataset', { required: true })

    await buildevents.install(apikey, dataset)

    buildevents.addFields({
      // available environment variables
      // https://docs.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
      'github.workflow': util.getEnv('GITHUB_WORKFLOW'),
      'github.run_id': util.getEnv('GITHUB_RUN_ID'),
      'github.run_number': util.getEnv('GITHUB_RUN_NUMBER'),
      'github.actor': util.getEnv('GITHUB_ACTOR'),
      'github.repository': util.getEnv('GITHUB_REPOSITORY'),
      'github.repository_owner': util.getEnv('GITHUB_REPOSITORY_OWNER'), // undocumented
      'github.event_name': util.getEnv('GITHUB_EVENT_NAME'),
      'github.sha': util.getEnv('GITHUB_SHA'),
      'github.ref': util.getEnv('GITHUB_REF'),
      'github.head_ref': util.getEnv('GITHUB_HEAD_REF'),
      'github.base_ref': util.getEnv('GITHUB_BASE_REF'),
      'github.job': util.getEnv('GITHUB_JOB'), // undocumented
      'github.matrix-key': core.getInput('matrix-key'),
      'runner.os': util.getEnv('RUNNER_OS'), // undocumented
      'meta.source': 'gha-buildevents'
    })

    // create a first step to time installation of buildevents
    await buildevents.step(traceId, util.randomInt(2 ** 32).toString(), buildStart.toString(), 'gha-buildevents_init')

    core.info('Init done! buildevents is now available on the path.')

    // set TRACE_ID to be used throughout the workflow
    util.setEnv('TRACE_ID', traceId)
    // save buildStart to be used in the post section
    core.saveState('buildStart', buildStart.toString())
    core.saveState('isPost', 'true')
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function runPost(): Promise<void> {
  try {
    const postStart = util.getTimestamp()

    const traceId = util.getEnv('TRACE_ID') ?? '0'
    const buildStart = core.getState('buildStart')

    const jobStatus = core.getInput('job-status', { required: true })
    const result = jobStatus.toUpperCase() == 'SUCCESS' ? 'success' : 'failure'

    buildevents.addFields({
      'job.status': jobStatus
    })

    await buildevents.step(traceId, util.randomInt(2 ** 32).toString(), postStart.toString(), 'gha-buildevents_post')
    await buildevents.build(traceId, buildStart, result)
  } catch (error) {
    core.setFailed(error.message)
  }
}

const isPost = !!core.getState('isPost')

if (!isPost) {
  run()
} else {
  runPost()
}

function generateTraceId(): string {
  const TRACE_ID_BYTES = 16
  const SHARED_BUFFER = Buffer.allocUnsafe(TRACE_ID_BYTES)
  for (let i = 0; i < TRACE_ID_BYTES / 4; i++) {
    // unsigned right shift drops decimal part of the number
    // it is required because if a number between 2**32 and 2**32 - 1 is generated, an out of range error is thrown by writeUInt32BE
    SHARED_BUFFER.writeUInt32BE((Math.random() * 2 ** 32) >>> 0, i * 4)
  }

  // If buffer is all 0, set the last byte to 1 to guarantee a valid w3c id is generated
  for (let i = 0; i < TRACE_ID_BYTES; i++) {
    if (SHARED_BUFFER[i] > 0) {
      break
    } else if (i === TRACE_ID_BYTES - 1) {
      SHARED_BUFFER[TRACE_ID_BYTES - 1] = 1
    }
  }

  return SHARED_BUFFER.toString('hex', 0, TRACE_ID_BYTES)
}
