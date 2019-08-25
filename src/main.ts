import {find} from '@actions/tool-cache'
import {which} from '@actions/io'
import {addPath} from '@actions/core/lib/core'
import {DownloadExtractInstall} from './toolHandler'
import * as path from 'path'

const IS_WINDOWS: boolean = process.platform === 'win32' ? true : false

export async function _installTool(): Promise<string>{
  
  const downloadUrl = IS_WINDOWS ? 'https://s3.amazonaws.com/aws-cli/AWSCLISetup.exe' : 'https://s3.amazonaws.com/aws-cli/awscli-bundle.zip'
  const tool = new DownloadExtractInstall(downloadUrl)

  const toolPath: string = find('aws', '*')
  if (toolPath) return toolPath

  // const awsPath: string = await which('aws', true)
  // if (awsPath) {
  //   const toolCachePath = await tool.cacheTool(awsPath, path.join(path.parse(awsPath).dir, 'log.txt'))
  //   console.log(awsPath)
  //   return toolCachePath
  // }
  

  let filePath = await tool.downloadFile()

  if (path.parse(filePath).ext === '.zip') {
    const extractedPath = await tool.extractFile(filePath)
    filePath = path.join(extractedPath, 'awscli-bundle', 'install')
  }

  const installDestinationDir = IS_WINDOWS ? 'C:\\PROGRA~1\\Amazon\\AWSCLI' : path.join(path.parse(filePath).dir, '.local', 'lib', 'aws')
  const installArgs: string[] = IS_WINDOWS ? ['/install', '/quiet', '/norestart'] : ['-i', installDestinationDir]
  await tool.installPackage(filePath, installArgs)

  const binFile = IS_WINDOWS ? 'aws.exe' : 'aws'
  const installedBinary = path.join(installDestinationDir, 'bin', binFile)
  
  const logFile =  path.normalize(path.join(path.parse(filePath).dir, 'log.txt'))
  const toolCachePath = await tool.cacheTool(installedBinary, logFile)
  await addPath(toolCachePath)

  return toolCachePath
}

// if (process.env.NODE_ENV != 'test') (async () => await _installTool())()
