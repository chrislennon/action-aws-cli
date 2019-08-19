import * as path from 'path'
import { cacheDir, downloadTool, extractZip } from '@actions/tool-cache'
import { ParsedPath } from "path"
import { exec } from '@actions/exec'
import {_filterVersion} from './util'
import * as io from '@actions/io'

// @ts-ignore
import firstline from 'firstline'

const IS_WINDOWS: boolean = process.platform === 'win32' ? true : false

export class DownloadExtractInstall {
  public downloadUrl: string
  public downloadPath: ParsedPath
  public extractedPath: ParsedPath
  public setupBinary: ParsedPath
  public installDestinationDir: ParsedPath
  public installedBinaryDir: ParsedPath
  public installedBinaryFile: ParsedPath
  public installedVersion: string
  public virtualEnvFile: ParsedPath

  public constructor(downloadUrl: string) {
    this.downloadUrl = downloadUrl
    this.downloadPath = path.parse('')
    this.extractedPath = path.parse('')
    this.setupBinary = path.parse('')
    this.installDestinationDir = path.parse('')
    this.installedBinaryDir = path.parse('')
    this.installedBinaryFile = path.parse('')
    this.installedVersion = ''
    this.virtualEnvFile = path.parse('')
  }

  public async _downloadUrl(): Promise<ParsedPath> {
    this.downloadPath = path.parse(await downloadTool(this.downloadUrl))
    return this.downloadPath
  }

  public async _extractFile(): Promise<ParsedPath> {
    const filePath = path.format(this.downloadPath)
    /* istanbul ignore next */
    if(process.platform === 'linux') {
      // await extractZip(downloadPath)
      // This command currently throws an error on linux TODO
      // Error: spawn /home/runner/work/action-aws-cli/action-aws-cli/node_modules/@actions/tool-cache/scripts/externals/unzip EACCES
      await exec(`unzip ${filePath} -d ${__dirname}`)
      this.extractedPath = path.parse(__dirname)
    } else {
      /* istanbul ignore next */
      this.extractedPath = path.parse(await extractZip(filePath))
    }

    this.setupBinary = path.parse(path.join(path.format(this.extractedPath), 'awscli-bundle', 'install'))
    this.installDestinationDir = path.parse(path.join(path.format(this.extractedPath), '.local', 'lib', 'aws'))

    const binDir = IS_WINDOWS ? 'Scripts' : 'bin'
    const binFile = IS_WINDOWS ? 'aws.cmd' : 'aws'
    const venvFile = IS_WINDOWS ? 'activate.bat' : 'activate'
    this.installedBinaryDir = path.parse(path.join(path.format(this.installDestinationDir), binDir))
    this.installedBinaryFile = path.parse(path.join(path.format(this.installedBinaryDir), binFile))
    this.virtualEnvFile = path.parse(path.join(path.format(this.installedBinaryDir), venvFile))

    return this.extractedPath
  }

  public async _installPackage(): Promise<number> {
    const pythonPath: string = await io.which('python', true)
    const installCommand: string = IS_WINDOWS ? pythonPath : `${path.format(this.setupBinary)} -i ${path.format(this.installDestinationDir)}`
    const installArgs: string[] = IS_WINDOWS ? [path.format(this.setupBinary), '-i', path.format(this.installDestinationDir)] : []
    return await exec(installCommand, installArgs)
  }

  private async _getVersion(): Promise<string> {
    let cmd: string = IS_WINDOWS ? `${path.format(this.virtualEnvFile)} && ` : ''
    cmd += path.format(this.installedBinaryFile)
    const versionCommandOutput = await this._getCommandOutput(cmd, ['--version'])
    this.installedVersion = _filterVersion(versionCommandOutput)
    return this.installedVersion
  }

  public async _cacheTool(): Promise<string> {
    const installedVersion = await this._getVersion()
    const cachedPath = await cacheDir(path.format(this.installedBinaryDir), 'aws', installedVersion)
    return cachedPath
  }

  private async _getCommandOutput(command: string, args: string[]): Promise<string> {

    let stdErr = ''
    const outputFileName = 'output.txt'
    const options = {
      windowsVerbatimArguments: true,
      listeners : {
        stderr: (data: Buffer) => { // AWS cli --version goes to stderr: https://stackoverflow.com/a/43284161
          stdErr += data.toString()
        }
      }
    }

    command = IS_WINDOWS ? command + ` > ${outputFileName}` : command

    await exec(command, args, options)

    const versionString = IS_WINDOWS ? await firstline(outputFileName) : stdErr
    return versionString
  }
}
