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
    const traceComponents = [
      util.getEnv('GITHUB_REPOSITORY'),
      util.getEnv('GITHUB_WORKFLOW'),
      util.getEnv('GITHUB_JOB'),
      util.getEnv('GITHUB_RUN_NUMBER'),
      core.getInput('matrix-key'),
      // append a random number to ensure traceId is unique when the workflow is re-run
      util.randomInt(2 ** 32).toString()
    ]
    const traceId = util.replaceSpaces(traceComponents.filter(value => value).join('-'))

    core.info(`Trace ID: ${traceId}`)

    const apikey = core.getInput('apikey', { required: true })
    core.setSecret(apikey)
    const dataset = core.getInput('dataset')
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
      'github.matrix-key': !core.getInput('matrix-key') ? 'test' : core.getInput('matrix-key'),
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
