import {find} from '@actions/tool-cache'
import {addPath} from '@actions/core/lib/core'
import {DownloadExtractInstall} from './toolHandler'
import * as path from 'path'

const IS_WINDOWS: boolean = process.platform === 'win32' ? true : false

export async function _installTool(): Promise<string>{
  const toolPath: string = find('aws', '*')
  if (toolPath) return toolPath

  const downloadUrl = IS_WINDOWS ? 'https://s3.amazonaws.com/aws-cli/AWSCLISetup.exe' : 'https://s3.amazonaws.com/aws-cli/awscli-bundle.zip'
  const tool = new DownloadExtractInstall(downloadUrl)
  let filePath = await tool.downloadFile()

  if (path.parse(filePath).ext === '.zip') {
    const extractedPath = await tool.extractFile(filePath)
    filePath = path.join(extractedPath, 'awscli-bundle', 'install')
  }

  const installDestinationDir = IS_WINDOWS ? 'C:\\Program Files\\Amazon\\AWSCLI' : path.join(path.parse(filePath).dir, '.local', 'lib', 'aws')
  const installArgs: string[] = IS_WINDOWS ? ['/install', '/quiet', '/norestart'] : ['-i', installDestinationDir]
  await tool.installPackage(filePath, installArgs)

  const binFile = IS_WINDOWS ? 'aws.exe' : 'aws'
  const installedBinary = path.join(installDestinationDir, 'bin', binFile)
  const toolCachePath = await tool.cacheTool(installedBinary)
  await addPath(toolCachePath)

  return toolCachePath
}

// if (process.env.NODE_ENV != 'test') (async () => await _installTool())()
