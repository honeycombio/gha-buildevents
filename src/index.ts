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
    const traceId = buildTraceId()

    core.info(`Trace ID: ${traceId}`)
    // set TRACE_ID to be used throughout the job
    util.setEnv('TRACE_ID', traceId)

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
    const initStepComponents = ['gha-buildevents_init', util.getEnv('GITHUB_JOB'), core.getInput('matrix-key')]
    await buildevents.step(
      traceId,
      util.randomInt(2 ** 32).toString(),
      buildStart.toString(),
      util.replaceSpaces(initStepComponents.filter(value => value).join('-'))
    )

    core.info('Init done! buildevents is now available on the path.')

    // save buildStart to be used in the post section
    core.saveState('buildStart', buildStart.toString())
    core.saveState('isPost', 'true')
    if (core.getInput('status') || core.getInput('job-status')) {
      core.saveState('endTrace', 'true')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function runPost(): Promise<void> {
  try {
    const postStart = util.getTimestamp()

    const traceId = buildTraceId()
    // use trace-start if it's provided otherwise use the start time for current job
    const traceStart = core.getInput('trace-start') ? core.getInput('trace-start') : core.getState('buildStart')
    // if status is empty, grab legacy job-status value
    const workflowStatus = core.getInput('status') ? core.getInput('status') : core.getInput('job-status')
    const result = workflowStatus.toUpperCase() == 'SUCCESS' ? 'success' : 'failure'

    buildevents.addFields({
      'job.status': workflowStatus,
      'workflow.status': workflowStatus
    })

    await buildevents.step(traceId, util.randomInt(2 ** 32).toString(), postStart.toString(), 'gha-buildevents_post')
    await buildevents.build(traceId, traceStart, result)
  } catch (error) {
    core.setFailed(error.message)
  }
}

const isPost = !!core.getState('isPost')
const endTrace = !!core.getState('endTrace')

if (!isPost) {
  run()
} else if (isPost && endTrace) {
  runPost()
}

function buildTraceId(): string {
  const traceComponents = [
    util.getEnv('GITHUB_REPOSITORY'),
    util.getEnv('GITHUB_WORKFLOW'),
    util.getEnv('GITHUB_RUN_NUMBER'),
    util.getEnv('GITHUB_RUN_ATTEMPT')
  ]
  return util.replaceSpaces(traceComponents.filter(value => value).join('-'))
}
