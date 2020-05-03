const core = require('@actions/core');

function getEnv(name) {
  return process.env[name];
}

function setEnv(name, value) {
  core.exportVariable(`${name}`, `${value}`);
}

function getTimestamp() {
  return Math.floor(new Date() / 1000);
}

function randomInt(max) {
  return Math.trunc((Math.random() * max));
}

module.exports = {
  getEnv,
  setEnv,
  getTimestamp,
  randomInt,
};
