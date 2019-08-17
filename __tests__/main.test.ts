import * as path from 'path'
const toolDir = path.join(
  __dirname,
  'runner',
  path.join(
    Math.random()
      .toString(36)
      .substring(7)
  ),
  'tools'
);
const tempDir = path.join(
  __dirname,
  'runner',
  path.join(
    Math.random()
      .toString(36)
      .substring(7)
  ),
  'temp'
);
process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;

import { run } from '../src/main'

describe('Setup And Install Drone', () => {
  beforeEach(async () => {
    jest.setTimeout(10000)
  })

  it('Will download and check aws-cli', async () => {
    jest.setTimeout(10000)
    await run()
  }, 10000);

});
