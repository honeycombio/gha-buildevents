const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');
const logfmt = require('logfmt');
const util = require('./util.js');

async function install(apikey, dataset) {
  console.log('Downloading buildevents to /usr/local/bin/buildevents');

  const url = 'https://github.com/honeycombio/buildevents/releases/latest/download/buildevents-linux-amd64';
  core.debug(`Downloading from ${url}`);

  let ret = await exec.exec(`sudo curl -L -o /usr/local/bin/buildevents ${url}`);
  if (ret != 0) {
    throw new Error('Downloading buildevents failed');
  }

  core.debug('Making buildevents executable');

  ret = await exec.exec('sudo chmod 755 /usr/local/bin/buildevents');
  if (ret != 0) {
    throw new Error('Making buildevents exectable failed');
  }

  util.setEnv('BUILDEVENT_APIKEY', apikey);
  util.setEnv('BUILDEVENT_DATASET', dataset);
  util.setEnv('BUILDEVENT_CIPROVIDER', 'github-actions');
}

function addFields(keyValueMap) {
  fs.writeFileSync('../buildevents.txt', logfmt.stringify(keyValueMap));
  util.setEnv('BUILDEVENT_FILE', '../buildevents.txt');
}

async function build(buildId, buildStart, result) {
  await buildeventsExec('build', buildId, buildStart, result);
}

async function step(buildId, stepId, startTime, name) {
  await buildeventsExec('step', buildId, stepId, startTime, name);
}

async function cmd(buildId, stepId, name, cmd) {
  await buildeventsExec('cmd', buildId, stepId, name, '--', cmd);
}

async function buildeventsExec(command, ...args) {
  let ret = await exec.exec(`buildevents ${command} ${args.join(' ')}`);
  if (ret != 0) {
    throw new Error(`Could not execute 'buildevents ${command}'`);
  }
}

module.exports = {
  install,
  addFields,
  build,
  step,
  cmd,
};
