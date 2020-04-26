const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');
const logfmt = require('logfmt');

async function run() {
  try {
    setEnv('BUILD_START', getTimestamp());

    const apikey = core.getInput('apikey', { required: true })
    core.setSecret(apikey);
    const dataset = core.getInput('dataset', { required: true });

    await installBuildevents();

    configureBuildevents(apikey, dataset);

    setEnv('BUILD_ID', getEnv('GITHUB_RUN_NUMBER'));

    console.log('Init done! buildevents is now available on the path.');

  } catch (error) {
    core.setFailed(error.message);
  }
}

async function installBuildevents() {
  console.log('Downloading buildevents to /usr/local/bin/buildevents');
  let ret = await exec.exec('sudo curl -L -o /usr/local/bin/buildevents https://github.com/honeycombio/buildevents/releases/latest/download/buildevents-linux-amd64');
  if (ret != 0) {
    throw new Error('Downloading buildevents failed');
  }

  console.log('Setting permissions for using buildevents');
  ret = await exec.exec('sudo chmod 755 /usr/local/bin/buildevents');
  if (ret != 0) {
    throw new Error('Making buildevents exectable failed');
  }
}

function configureBuildevents(apikey, dataset) {
  // environment variables used by buildevents
  setEnv('BUILDEVENT_APIKEY', apikey);
  setEnv('BUILDEVENT_DATASET', dataset);
  setEnv('BUILDEVENT_CIPROVIDER', 'github-actions');

  const variables = logfmt.stringify({
    'github.workflow': getEnv('GITHUB_WORKFLOW'),
    'github.run_number': getEnv('GITHUB_RUN_NUMBER'),
    'github.event_name': getEnv('GITHUB_EVENT_NAME'),
    'github.sha': getEnv('GITHUB_SHA'),
    'github.ref': getEnv('GITHUB_REF'),
  });
  fs.writeFileSync('../buildevents.txt', variables);

  setEnv('BUILDEVENT_FILE', '../buildevents.txt');
}

function getTimestamp() {
  return Math.floor(new Date() / 1000);
}

function setEnv(name, value) {
  core.exportVariable(`${name}`, `${value}`);
}

function getEnv(name) {
  return process.env[name];
}

run();
