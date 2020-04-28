const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');
const logfmt = require('logfmt');
const util = require('./util.js');

async function run() {
  try {
    const buildStart = util.getTimestamp();
    core.saveState('buildStart', buildStart.toString());

    const apikey = core.getInput('apikey', { required: true })
    core.setSecret(apikey);
    const dataset = core.getInput('dataset', { required: true });

    await installBuildevents();

    configureBuildevents(apikey, dataset);

    util.setEnv('BUILD_ID', util.getEnv('GITHUB_RUN_NUMBER'));

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
  util.setEnv('BUILDEVENT_APIKEY', apikey);
  util.setEnv('BUILDEVENT_DATASET', dataset);
  util.setEnv('BUILDEVENT_CIPROVIDER', 'github-actions');

  const variables = logfmt.stringify({
    'github.workflow': util.getEnv('GITHUB_WORKFLOW'),
    'github.run_id': util.getEnv('GITHUB_RUN_ID'),
    'github.run_number': util.getEnv('GITHUB_RUN_NUMBER'),
    'github.actor': util.getEnv('GITHUB_ACTOR'),
    'github.repository': util.getEnv('GITHUB_REPOSITORY'),
    'github.event_name': util.getEnv('GITHUB_EVENT_NAME'),
    'github.sha': util.getEnv('GITHUB_SHA'),
    'github.ref': util.getEnv('GITHUB_REF'),
  });
  fs.writeFileSync('../buildevents.txt', variables);

  util.setEnv('BUILDEVENT_FILE', '../buildevents.txt');
}

run();
