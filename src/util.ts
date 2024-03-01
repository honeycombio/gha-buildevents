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

export function replaceSpaces(str: string): string {
  return str.replace(/\s+/g, '_')
}

export function constructExecutableName(): string {
  let processArch = ''
  switch (process.arch) {
    case 'x64':
      processArch = 'amd64'
      break
    case 'ia32':
      processArch = '386'
      break
    case 'arm64':
      processArch = 'arm64'
      break
    default:
      throw new Error(`Unsupported arch ${process.arch}'`)
  }

  let processPlatform = ''
  switch (process.platform) {
    case 'darwin':
      processPlatform = 'darwin'
      break
    case 'linux':
      processPlatform = 'linux'
      break
    case 'win32':
      processPlatform = 'windows'
      break
    default:
      throw new Error(`Unsupported platform ${process.platform}'`)
  }

  return 'buildevents-' + processPlatform + '-' + processArch
}
