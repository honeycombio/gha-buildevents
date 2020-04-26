const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
    console.log(process.env);
    
    const buildStart = Math.floor(new Date() / 1000);
    // core.saveState('buildStart', buildStart);

    core.debug(`Build started at ${buildStart}`);

    const apikey = core.getInput('apikey', { required: true })
    core.setSecret(apikey);
    const dataset = core.getInput('dataset')

    core.debug(`Got inputs:\n\tapikey: ${apikey}\n\tdataset: ${dataset}`);

    core.debug('Download buildevents to /usr/local/bin/buildevents');
    await exec.exec('sudo curl -L -o /usr/local/bin/buildevents https://github.com/honeycombio/buildevents/releases/latest/download/buildevents-linux-amd64')

    core.debug('Setting permissions');
    await exec.exec('sudo chmod 755 /usr/local/bin/buildevents')

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
