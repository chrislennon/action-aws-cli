import {find} from '@actions/tool-cache'
import {addPath} from '@actions/core/lib/core'
import {DownloadExtractInstall} from './toolHandler'

export async function _installTool(): Promise<string>{
  const toolPath: string = find('aws', '*')
  if (toolPath) return toolPath

  const tool = new DownloadExtractInstall('https://s3.amazonaws.com/aws-cli/awscli-bundle.zip')
  await tool.downloadFile()
  await tool.extractFile()
  await tool.installPackage()
  const toolCachePath = await tool.cacheTool()
  await addPath(toolCachePath)
  return toolCachePath
}

// if (process.env.NODE_ENV != 'test') (async () => await _installTool())()
