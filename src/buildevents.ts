import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import * as octokit from '@octokit/rest'
import * as logfmt from 'logfmt'
import * as util from './util'

export async function install(apikey: string, dataset: string): Promise<void> {
  console.log('Installing buildevents')

  console.log(process.env)

  const octo = new octokit.Octokit()

  let latestRelease = await octo.repos.getLatestRelease({ owner: 'honeycombio', repo: 'buildevents' })
  let version = latestRelease.data.tag_name

  let toolPath = tc.find('buildevents', version)
  if (!toolPath) {
    console.log(`Downloading buildevents ${version}`)

    const url = `https://github.com/honeycombio/buildevents/releases/download/${version}/buildevents-linux-amd64`

    const downloadPath = await tc.downloadTool(url)
    toolPath = path.join(path.dirname(downloadPath), 'buildevents')
    await io.mv(downloadPath, toolPath)

    await exec.exec(`chmod +x ${toolPath}`)

    toolPath = await tc.cacheDir(path.dirname(toolPath), 'buildevents', version)
  }
  core.addPath(toolPath)

  util.setEnv('BUILDEVENT_APIKEY', apikey)
  util.setEnv('BUILDEVENT_DATASET', dataset)
  util.setEnv('BUILDEVENT_CIPROVIDER', 'github-actions')
}

export function addFields(keyValueMap: object): void {
  fs.writeFileSync('../buildevents.txt', logfmt.stringify(keyValueMap))
  util.setEnv('BUILDEVENT_FILE', '../buildevents.txt')
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
