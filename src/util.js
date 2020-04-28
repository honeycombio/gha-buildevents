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

module.exports = {
  getEnv,
  setEnv,
  getTimestamp,
};
