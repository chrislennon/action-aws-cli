import {getLocalDir} from './util'
const tempPath =  getLocalDir('temp')
const cachePath = getLocalDir('tools')

// @actions/tool-cache plays with these on load - force them for testing
process.env['RUNNER_TEMP'] = tempPath
process.env['RUNNER_TOOL_CACHE'] = cachePath

import {rmRF} from '@actions/io'
import {cacheFile, downloadTool, find} from '@actions/tool-cache'
import nock from 'nock'
import {_installTool} from '../src/main'
import {_filterVersion} from "../src/util"

function setupTest(): void
{
  beforeAll(function () {
    nock('http://example.com')
      .persist()
      .get('/bytes/35')
      .reply(200)
  })
  beforeEach(async function () {
    await rmRF(cachePath)
    await rmRF(tempPath)
  })
  afterAll(async function () {
    await rmRF(tempPath)
    await rmRF(cachePath)
  })
}

describe('Test Functions', () => {
  setupTest()
  it('Will give the tool path if already set', async () => {
    const downPath: string = await downloadTool(
      'http://example.com/bytes/35'
    )
    await cacheFile(downPath, 'aws', 'aws', '1.1.0')
    const toolPath: string = find('aws', '1.1.0')
    const cachedPath = await _installTool()
    expect(cachedPath).toBe(toolPath)
  })

  it('Will parse a std(out/err) string and return the version', () => {
    const msg = 'aws-cli/1.16.220 Python/2.7.10 Darwin/18.2.0 botocore/1.12.210'
    const expectedVersion = '1.16.220'
    const msgErr = 'unexpected stdout'
    const returnedVersion = _filterVersion(msg)
    const returnedVersionErr = _filterVersion(msgErr)
    expect(returnedVersion).toEqual(expectedVersion)
    expect(returnedVersionErr).toEqual('0.0.0')
  })
})

describe('Test End to End', () => {
  setupTest()
  const installTimeout = 300000
  it('Will download, cache and return aws-cli', async () => {
    jest.setTimeout(installTimeout)
    const toolPath = await _installTool()
    expect(toolPath).toContain('aws')
  }, installTimeout)

})
