import {exec} from '@actions/exec'
import {cacheDir, downloadTool, extractZip} from '@actions/tool-cache'
// @ts-ignore
import firstline from 'firstline'
import * as path from 'path'
import {_filterVersion} from './util'
import {mv} from '@actions/io'

const IS_WINDOWS: boolean = process.platform === 'win32' ? true : false

export class DownloadExtractInstall {
  private readonly downloadUrl: string
  private readonly fileType: string

  public constructor(downloadUrl: string) {
    this.downloadUrl = downloadUrl
    this.fileType = this.downloadUrl.substr(-4)
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
    command = IS_WINDOWS ? `${command} > ${outputFileName}` : command

    await exec(command, args, options)

    return IS_WINDOWS ? await firstline(outputFileName) : stdErr
  }

  private async _getVersion(installedBinary: string): Promise<string> {
    const versionCommandOutput = IS_WINDOWS ?  await this._getCommandOutput(`${installedBinary} --version`, []) : await this._getCommandOutput(installedBinary, ['--version'])
    const installedVersion = _filterVersion(versionCommandOutput)

    return installedVersion
  }

  public async downloadFile(): Promise<string> {
    const filePath = await downloadTool(this.downloadUrl)
    const destPath = `${filePath}${this.fileType}`

    await mv(filePath, destPath)

    return destPath
  }

  public async extractFile(filePath: string): Promise<string> {
    const extractDir = path.dirname(filePath)

    // await extractZip(this.downloadedFile) // This command currently throws an error on linux TODO
    // Error: spawn /home/runner/work/action-aws-cli/action-aws-cli/node_modules/@actions/tool-cache/scripts/externals/unzip EACCES
    if(process.platform === 'linux') { // Workaround
      await exec(`unzip ${filePath}`, ['-d', extractDir])
      return extractDir
    }

    return await extractZip(filePath, extractDir)
  }

  public async installPackage(installCommand: string, installArgs: string[]): Promise<number> {
    // if (IS_WINDOWS) await exec('cmd /c setx /M path "%path%;C:\\Program Files\\Amazon\\AWSCLI\"') //  ¯\_(ツ)_/¯
    return await exec(installCommand, installArgs)
  }

  public async cacheTool(installedBinary: string): Promise<string> {
    const installedVersion = await this._getVersion(installedBinary)
    const cachedPath = await cacheDir(path.parse(installedBinary).dir, 'aws', installedVersion)

    return cachedPath
  }
}
