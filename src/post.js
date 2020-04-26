const core = require('@actions/core');
const exec = require('@actions/exec');

async function runPost() {
  try {
    const buildId = getEnv('BUILD_ID');
    const buildStart = getEnv('BUILD_START')
    const result = 'success';

    let ret = await exec.exec(`buildevents build ${buildId} ${buildStart} ${result}`);
    if (ret != 0) {
      throw new Error('Could not build trace');
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

function getEnv(name) {
  return process.env[name];
}

runPost();
