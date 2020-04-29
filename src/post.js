const core = require('@actions/core');
const buildevents = require('./buildevents.js');
const util = require('./util.js');

async function runPost() {
  try {
    const postStart = util.getTimestamp();

    const buildId = util.getEnv('BUILD_ID');
    const buildStart = core.getState('buildStart');

    const jobStatus = core.getInput('job-status', { required: true });
    const result = jobStatus == 'Success' ? 'success' : 'failure';

    buildevents.addFields({
      'github.workflow': util.getEnv('GITHUB_WORKFLOW'),
      'github.run_id': util.getEnv('GITHUB_RUN_ID'),
      'github.run_number': util.getEnv('GITHUB_RUN_NUMBER'),
      'github.actor': util.getEnv('GITHUB_ACTOR'),
      'github.repository': util.getEnv('GITHUB_REPOSITORY'),
      'github.event_name': util.getEnv('GITHUB_EVENT_NAME'),
      'github.sha': util.getEnv('GITHUB_SHA'),
      'github.ref': util.getEnv('GITHUB_REF'),
      'job.status': jobStatus,
    });

    await buildevents.step(buildId, 1001, postStart, 'post');
    await buildevents.build(buildId, buildStart, result);

  } catch (error) {
    core.setFailed(error.message);
  }
}

runPost();
