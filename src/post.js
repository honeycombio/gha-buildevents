const core = require('@actions/core');
const exec = require('@actions/exec');
const util = require('./util.js');

async function runPost() {
  try {
    const buildId = util.getEnv('BUILD_ID');
    const buildStart = core.getState('buildStart')

    const jobStatus = core.getInput('job-status', { required: true });
    const result = jobStatus == 'Success' ? 'success' : 'failure';

    let ret = await exec.exec(`buildevents build ${buildId} ${buildStart} ${result}`);
    if (ret != 0) {
      throw new Error('Could not build trace');
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

runPost();
