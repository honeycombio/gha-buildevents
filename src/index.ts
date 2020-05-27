import * as core from '@actions/core'
import * as buildevents from './buildevents.js'
import * as util from './util.js'

async function run(): Promise<void> {
  try {
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
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
