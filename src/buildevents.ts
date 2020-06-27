import * as fs from 'fs'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as logfmt from 'logfmt'
import * as util from './util'

export async function install(apikey: string, dataset: string): Promise<void> {
  console.log('Downloading buildevents to /usr/local/bin/buildevents')

  const url = 'https://github.com/honeycombio/buildevents/releases/latest/download/buildevents-linux-amd64'
  core.debug(`Downloading from ${url}`)

  let ret = await exec.exec(`sudo curl -L -o /usr/local/bin/buildevents ${url}`)
  if (ret != 0) {
    throw new Error('Downloading buildevents failed')
  }

  core.debug('Making buildevents executable')

  ret = await exec.exec('sudo chmod 755 /usr/local/bin/buildevents')
  if (ret != 0) {
    throw new Error('Making buildevents exectable failed')
  }

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
