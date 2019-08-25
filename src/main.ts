

import {addPath} from '@actions/core/lib/core'
import {DownloadExtractInstall} from './toolHandler'
import * as path from 'path'

const IS_WINDOWS: boolean = process.platform === 'win32' ? true : false

export async function _installTool(): Promise<string>{

  const downloadUrl = IS_WINDOWS ? 'https://s3.amazonaws.com/aws-cli/AWSCLISetup.exe' : 'https://s3.amazonaws.com/aws-cli/awscli-bundle.zip'
  const tool = new DownloadExtractInstall(downloadUrl)

  const isInstalled = await tool.isAlreadyInstalled('aws')
  if(typeof isInstalled === 'string') {
    console.log('Already installed but ignoring', isInstalled)
    // TODO Figure out what is best to do when already found
    // return isInstalled
  }

  let installFilePath = await tool.downloadFile()

  const rootPath = path.parse(installFilePath).dir
  const installDestinationDir = IS_WINDOWS ? 'C:\\PROGRA~1\\Amazon\\AWSCLI' : path.join(rootPath, '.local', 'lib', 'aws')
  const installArgs: string[] = IS_WINDOWS ? ['/install', '/quiet', '/norestart'] : ['-i', installDestinationDir]
  const binFile = IS_WINDOWS ? 'aws.exe' : 'aws'
  const installedBinary = path.join(installDestinationDir, 'bin', binFile)

  if (path.parse(installFilePath).ext === '.zip') {
    const extractedPath = await tool.extractFile(installFilePath)
    installFilePath = path.join(extractedPath, 'awscli-bundle', 'install')
  }

  await tool.installPackage(installFilePath, installArgs)

  const toolCachePath = await tool.cacheTool(installedBinary)
  await addPath(toolCachePath)

  return toolCachePath
}

// if (process.env.NODE_ENV != 'test') (async () => await _installTool())()
