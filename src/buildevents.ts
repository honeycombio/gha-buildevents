import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import * as logfmt from 'logfmt'
import * as util from './util.js'

// tc.downloadTool only retries 3 times over ~30s, which is shorter than the GitHub
// release-asset outages we see (504s lasting a few minutes). Retry the whole download
// with exponential backoff: waits of 20s, 40s and 80s between 4 attempts.
const DOWNLOAD_ATTEMPTS = 4
const DOWNLOAD_BACKOFF_SECONDS = 20

async function downloadWithRetry(url: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await tc.downloadTool(url)
    } catch (err) {
      if (attempt >= DOWNLOAD_ATTEMPTS) throw err
      const wait = DOWNLOAD_BACKOFF_SECONDS * 2 ** (attempt - 1)
      core.warning(`Download attempt ${attempt}/${DOWNLOAD_ATTEMPTS} failed: ${err}. Retrying in ${wait} seconds`)
      await new Promise(resolve => setTimeout(resolve, wait * 1000))
    }
  }
}

export async function install(apikey: string, apihost: string, dataset: string): Promise<void> {
  core.info('Downloading and installing buildevents')

  const url = 'https://github.com/honeycombio/buildevents/releases/latest/download/' + util.constructExecutableName()
  core.info(`Downloading from ${url}`)

  const downloadPath = await downloadWithRetry(url)

  // rename downloaded binary - downloadPath is similar to a UUID by default
  const exeName = process.platform === 'win32' ? 'buildevents.exe' : 'buildevents'
  const toolPath = path.join(path.dirname(downloadPath), exeName)
  await io.mv(downloadPath, toolPath)

  // make executable and add to path
  if (process.platform !== 'win32') {
    await exec.exec(`chmod +x ${toolPath}`)
  }
  core.addPath(path.dirname(toolPath))

  util.setEnv('BUILDEVENT_APIKEY', apikey)
  util.setEnv('BUILDEVENT_APIHOST', apihost)
  util.setEnv('BUILDEVENT_DATASET', dataset)
  util.setEnv('BUILDEVENT_CIPROVIDER', 'gha-buildevents')
}

export function addFields(keyValueMap: object): void {
  const BUILDEVENT_FILE = 'BUILDEVENT_FILE'

  let envPath = util.getEnv(BUILDEVENT_FILE)
  if (!envPath) {
    envPath = path.resolve('../buildevents.txt')
    util.setEnv(BUILDEVENT_FILE, envPath)
  }
  // Add the existing values from the BUILDEVENT_FILE to the fields we write out
  // this deliberately lets existing values - presumably from the workflow - override
  // the defaults we set.
  if (fs.existsSync(envPath)) {
    Object.assign(keyValueMap, logfmt.parse(fs.readFileSync(envPath).toString()))
  }
  fs.writeFileSync(envPath, logfmt.stringify(keyValueMap))
}

export async function build(buildId: string, buildStart: string, result: string): Promise<void> {
  await buildeventsExec('build', buildId, buildStart, result)
}

export async function step(buildId: string, stepId: string, startTime: string, name: string): Promise<void> {
  await buildeventsExec('step', buildId, stepId, startTime, name)
}

export async function cmd(buildId: string, stepId: string, name: string, cmd: string): Promise<void> {
  await buildeventsExec('cmd', buildId, stepId, name, '--', cmd)
}

export async function buildeventsExec(command: string, ...args: string[]): Promise<void> {
  let ret = await exec.exec(`buildevents ${command} ${args.join(' ')}`)
  if (ret != 0) {
    throw new Error(`Could not execute 'buildevents ${command}'`)
  }
}
