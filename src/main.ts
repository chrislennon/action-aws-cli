import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as os from 'os'
import { promisify } from 'util'
import { exec } from 'child_process'
import * as path from 'path'

const execP = promisify(exec)
const osPlat: string = os.platform()

export async function run(): Promise<void> {
  try {
    let toolPath: string
    toolPath = tc.find('aws', '*')

    if (!toolPath) {
      const downloadUrl = `https://s3.amazonaws.com/aws-cli/awscli-bundle.zip`
      const downloadPath = await tc.downloadTool(downloadUrl)
      let extPath: string
      if (osPlat === 'darwin') {
        extPath = await tc.extractTar(downloadPath)
      } else if (osPlat === 'linux') {
        // extPath = await tc.extractZip(downloadPath)
        extPath = __dirname
        await execP(`unzip ${downloadPath} -d ${extPath}`)
      } else {
        extPath = '/home/runner/work/_temp/'
      }

      const installPath = `${extPath}/.local/lib/aws`
      const binPath = `${installPath}/bin`

      await execP(`${extPath}/awscli-bundle/install -i ${installPath}`)

      await new Promise(async (resolve, reject)=> {
        exec(`${binPath}/aws --version`, async (err, stout, sterr) => {
          const response = err ? stout : sterr
          const regex = /(\d+\.)(\d+\.)(\d+)/g
          const cliVersion = response.match(regex)
          if (cliVersion !== null) {
            const cachedPath = await tc.cacheDir(binPath, 'aws', cliVersion[0])
            core.addPath(cachedPath)
            resolve()
          } else {
            reject()
          }
        })
      })
    }
  } catch (err) {
    console.error(err)
  }
}

run()
