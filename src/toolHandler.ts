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

  private async _getVersion(installDestinationDir: string): Promise<string> {
    const binDir = IS_WINDOWS ? 'Scripts' : 'bin'
    const binFile = IS_WINDOWS ? 'aws.cmd' : 'aws'
    const installedBinaryDir = join(installDestinationDir, binDir)
    const installedBinaryFile = join(installedBinaryDir, binFile)
    //const cmd: string = IS_WINDOWS ? `${this.virtualEnvFile} && ${this.installedBinaryFile}` : this.installedBinaryFile

    const versionCommandOutput = IS_WINDOWS ?  await this._getCommandOutput('"C:\\Program Files\\Amazon\\AWSCLI\\aws.exe" --version', []) : await this._getCommandOutput(installedBinaryFile, ['--version'])
    const installedVersion = _filterVersion(versionCommandOutput)
    return installedVersion
  }

  public async downloadFile(): Promise<string> {
    return await downloadTool(this.downloadUrl)
  }

  public async extractFile(filePath: string): Promise<string> {
    if (this.fileType === '.exe') {
      await exec(`cmd /c move ${filePath} ${filePath}.exe`)
      return __dirname
    }

    // await extractZip(this.downloadedFile) // This command currently throws an error on linux TODO
    // Error: spawn /home/runner/work/action-aws-cli/action-aws-cli/node_modules/@actions/tool-cache/scripts/externals/unzip EACCES
    if(process.platform === 'linux') await exec(`unzip ${filePath}`)  // Workaround

    return (process.platform === 'linux') ? __dirname : await extractZip(filePath)
  }

  public async installPackage(filePath: string, extractedPath: string): Promise<string> {
    const setupBinary = join(extractedPath, 'awscli-bundle', 'install')
    const installDestinationDir = IS_WINDOWS ? 'C:\\Program Files\\Amazon\\AWSCLI' : join(extractedPath, '.local', 'lib', 'aws')
    const installCommand: string = IS_WINDOWS ? filePath : `${setupBinary} -i ${installDestinationDir}`
    const installArgs: string[] = IS_WINDOWS ? ['/install', '/quiet', '/norestart'] : []

    await exec(installCommand, installArgs)
    // if (IS_WINDOWS) await exec('cmd /c setx /M path "%path%;C:\\Program Files\\Amazon\\AWSCLI\"')
    //  ¯\_(ツ)_/¯

    return installDestinationDir
  }

  public async cacheTool(installDestinationDir: string): Promise<string> {
    const installedVersion = await this._getVersion(installDestinationDir)
    const installedBinaryDir = join(installDestinationDir, 'bin')

    const cachedPath = await cacheDir(installedBinaryDir, 'aws', installedVersion)
    return cachedPath
  }
}
