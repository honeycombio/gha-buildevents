import * as core from '@actions/core'

export function getEnv(name: string): string | undefined {
  return process.env[name]
}

export function setEnv(name: string, value: string): void {
  core.exportVariable(name, value)
}

export function getTimestamp(): number {
  return Math.floor(new Date().valueOf() / 1000)
}

export function randomInt(max: number): number {
  return Math.trunc(Math.random() * max)
}
