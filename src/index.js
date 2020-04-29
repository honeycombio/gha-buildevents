const core = require('@actions/core');
const buildevents = require('./buildevents.js');
const util = require('./util.js');

async function run() {
  try {
    const buildStart = util.getTimestamp();
    const buildId = util.getEnv('GITHUB_RUN_NUMBER');

    // save buildStart to be used in the post section
    core.saveState('buildStart', buildStart.toString());
    // set BUILD_ID to be used throughout the workflow
    util.setEnv('BUILD_ID', buildId);

    const apikey = core.getInput('apikey', { required: true })
    core.setSecret(apikey);
    const dataset = core.getInput('dataset', { required: true });

    await buildevents.install(apikey, dataset);

    await buildevents.step(buildId, 1000, buildStart, 'init');

    console.log('Init done! buildevents is now available on the path.');

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
