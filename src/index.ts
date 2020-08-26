import * as core from '@actions/core'
import * as buildevents from './buildevents.js'
import * as util from './util.js'

async function run(): Promise<void> {
  try {
    core.debug('Environment variables:')
    for (const key in process.env) {
      core.debug(`- ${key} = ${process.env[key]}`)
    }

    const buildStart = util.getTimestamp()
    const traceId = util.getEnv('GITHUB_RUN_NUMBER') ?? '0'

    // save buildStart to be used in the post section
    core.saveState('buildStart', buildStart.toString())

    const apikey = core.getInput('apikey', { required: true })
    core.setSecret(apikey)
    const dataset = core.getInput('dataset', { required: true })

    await buildevents.install(apikey, dataset)

    // create a first step to time installation of buildevents
    await buildevents.step(traceId, util.randomInt(2 ** 32).toString(), buildStart.toString(), 'gha-buildevents_init')

    // set TRACE_ID to be used throughout the workflow
    util.setEnv('TRACE_ID', traceId)

    console.log('Init done! buildevents is now available on the path.')

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
      // available environment variables
      // https://docs.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
      'github.workflow': util.getEnv('GITHUB_WORKFLOW'),
      'github.run_id': util.getEnv('GITHUB_RUN_ID'),
      'github.run_number': util.getEnv('GITHUB_RUN_NUMBER'),
      'github.actor': util.getEnv('GITHUB_ACTOR'),
      'github.repository': util.getEnv('GITHUB_REPOSITORY'),
      'github.event_name': util.getEnv('GITHUB_EVENT_NAME'),
      'github.event_path': util.getEnv('GITHUB_EVENT_PATH'),
      'github.sha': util.getEnv('GITHUB_SHA'),
      'github.ref': util.getEnv('GITHUB_REF'),
      'github.head_ref': util.getEnv('GITHUB_HEAD_REF'),
      'github.base_ref': util.getEnv('GITHUB_BASE_REF'),
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
