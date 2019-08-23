import {exec} from '@actions/exec'
import {cacheDir, downloadTool, extractZip} from '@actions/tool-cache'
// @ts-ignore
import firstline from 'firstline'
import {join} from 'path'
import {_filterVersion} from './util'

const IS_WINDOWS: boolean = process.platform === 'win32' ? true : false

export class DownloadExtractInstall {
  private readonly downloadUrl: string
  private extractedPath: string
  private readonly fileType: string

  public constructor(downloadUrl: string) {
    this.downloadUrl = downloadUrl
    this.extractedPath = __dirname
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

  private async _getVersion(installedBinaryDir: string): Promise<string> {
    const binFile = IS_WINDOWS ? 'aws.exe' : 'aws'
    const installedBinaryFile = join(installedBinaryDir, binFile)
    const versionCommandOutput = IS_WINDOWS ?  await this._getCommandOutput(`${installedBinaryFile} --version`, []) : await this._getCommandOutput(installedBinaryFile, ['--version'])
    const installedVersion = _filterVersion(versionCommandOutput)
    return installedVersion
  }

  public async downloadFile(): Promise<string> {
    const filePath = await downloadTool(this.downloadUrl)
    if (this.fileType === '.exe') await exec(`cmd /c move ${filePath} ${filePath}.exe`)
    return filePath
  }

  public async extractFile(filePath: string): Promise<string> {
    // await extractZip(this.downloadedFile) // This command currently throws an error on linux TODO
    // Error: spawn /home/runner/work/action-aws-cli/action-aws-cli/node_modules/@actions/tool-cache/scripts/externals/unzip EACCES
    if(process.platform === 'linux') { // Workaround
      await exec(`unzip ${filePath} -d ${filePath}/extract`)
      return filePath
    }
    return await extractZip(filePath, `${filePath}/extract`)
  }

  public async installPackage(filePath: string, extractedPath: string): Promise<string> {
    const setupBinary = join(extractedPath, 'awscli-bundle', 'install')
    const installDestinationDir = IS_WINDOWS ? 'C:\\Program Files\\Amazon\\AWSCLI' : join(extractedPath, '.local', 'lib', 'aws')
    const installCommand: string = IS_WINDOWS ? filePath : `${setupBinary} -i ${installDestinationDir}`
    const installArgs: string[] = IS_WINDOWS ? ['/install', '/quiet', '/norestart'] : []
    await exec(installCommand, installArgs)
    // if (IS_WINDOWS) await exec('cmd /c setx /M path "%path%;C:\\Program Files\\Amazon\\AWSCLI\"') //  ¯\_(ツ)_/¯
    return installDestinationDir
  }

  public async cacheTool(installDestinationDir: string): Promise<string> {
    const installedBinaryDir = join(installDestinationDir, 'bin')
    const installedVersion = await this._getVersion(installedBinaryDir)
    const cachedPath = await cacheDir(installedBinaryDir, 'aws', installedVersion)
    return cachedPath
  }
}
