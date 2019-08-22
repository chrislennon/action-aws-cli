import {exec} from '@actions/exec'
import {which} from '@actions/io'
import {cacheDir, downloadTool, extractZip} from '@actions/tool-cache'
// @ts-ignore
import firstline from 'firstline'
import {join} from 'path'
import {_filterVersion} from './util'


const IS_WINDOWS: boolean = process.platform === 'win32' ? true : false

export class DownloadExtractInstall {
  private readonly downloadUrl: string
  private downloadedFile: string
  private extractedPath: string
  private setupBinary: string
  private installDestinationDir: string
  private installedBinaryDir: string
  private installedBinaryFile: string
  private installedVersion: string
  private virtualEnvFile: string

  public constructor(downloadUrl: string) {

    this.downloadUrl = downloadUrl
    this.downloadedFile = ''
    this.extractedPath = __dirname
    const derivedPaths = this._updatePaths(this.extractedPath)
    // @ts-ignore
    const {setupBinary, installedBinaryDir, installDestinationDir, virtualEnvFile, installedBinaryFile} = derivedPaths
    this.setupBinary = setupBinary
    this.installDestinationDir = installDestinationDir
    this.installedBinaryDir = installedBinaryDir
    this.installedBinaryFile = installedBinaryFile
    this.virtualEnvFile = virtualEnvFile
    this.installedVersion = ''
  }

  private _updatePaths(extractedPath: string): object {
    const binDir = IS_WINDOWS ? 'Scripts' : 'bin'
    const binFile = IS_WINDOWS ? 'aws.cmd' : 'aws'
    const venvFile = IS_WINDOWS ? 'activate.bat' : 'activate'
    const setupBinary = join(extractedPath, 'awscli-bundle', 'install')
    const installDestinationDir = join(extractedPath, '.local', 'lib', 'aws')
    const installedBinaryDir = join(installDestinationDir, binDir)
    const installedBinaryFile = join(installedBinaryDir, binFile)
    const virtualEnvFile = join(installedBinaryDir, venvFile)

    this.setupBinary = setupBinary
    this.installDestinationDir = installDestinationDir
    this.installedBinaryDir = installedBinaryDir
    this.installedBinaryFile = installedBinaryFile
    this.virtualEnvFile = virtualEnvFile

    const derivedPaths = {
      setupBinary,
      installDestinationDir,
      installedBinaryDir,
      installedBinaryFile,
      virtualEnvFile
    }
    return derivedPaths
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
    const versionString = IS_WINDOWS ? await firstline(outputFileName) : stdErr
    return versionString
  }

  private async _getVersion(): Promise<string> {
    const cmd: string = IS_WINDOWS ? `${this.virtualEnvFile} && ${this.installedBinaryFile}` : this.installedBinaryFile
    const versionCommandOutput = await this._getCommandOutput(cmd, ['--version'])
    this.installedVersion = _filterVersion(versionCommandOutput)
    return this.installedVersion
  }

  public async downloadFile(): Promise<string> {
    this.downloadedFile = await downloadTool(this.downloadUrl)
    return this.downloadedFile
  }

  public async extractFile(): Promise<string> {
    const filePath = this.downloadedFile
    /* istanbul ignore next */
    if(process.platform === 'linux') {
      // await extractZip(this.downloadedFile) // This command currently throws an error on linux TODO
      // Error: spawn /home/runner/work/action-aws-cli/action-aws-cli/node_modules/@actions/tool-cache/scripts/externals/unzip EACCES
      await exec(`unzip ${filePath} -d ${this.extractedPath}`)
    } else {
      /* istanbul ignore next */
      this.extractedPath = await extractZip(filePath)
      this._updatePaths(this.extractedPath)
    }
    return this.extractedPath
  }

  public async installPackage(): Promise<number> {
    const pythonPath: string = await which('python', true)
    const installCommand: string = IS_WINDOWS ? pythonPath : `${this.setupBinary} -i ${this.installDestinationDir}`
    const installArgs: string[] = IS_WINDOWS ? [this.setupBinary, '-i', this.installDestinationDir] : []
    return await exec(installCommand, installArgs)
  }

  public async cacheTool(): Promise<string> {
    const installedVersion = await this._getVersion()
    const cachedPath = await cacheDir(this.installedBinaryDir, 'aws', installedVersion)
    return cachedPath
  }
}
