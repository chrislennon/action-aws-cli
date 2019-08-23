import * as fs from 'fs'

export function _filterVersion(stdmsg: string): string {
  const cliVersion = stdmsg.match('(\\d+\\.)(\\d+\\.)(\\d+)')
  if (cliVersion) return cliVersion[0]
  else return '0.0.0'
}

export function _readFile(path: string, usrOpts: object): Promise<string> {
  const opts = {
    encoding: 'utf8',
    lineEnding: '\n'
  };
  Object.assign(opts, usrOpts);
  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(path, {encoding: opts.encoding});
    let acc = '';
    let pos = 0;
    let index;
    rs
      .on('data', chunk => {
        index = chunk.indexOf(opts.lineEnding);
        acc += chunk;
        if (index === -1) {
          pos += chunk.length;
        } else {
          pos += index;
          rs.close();
        }
      })
      .on('close', () => resolve(acc.slice(acc.charCodeAt(0) === 0xFEFF ? 1 : 0, pos)))
      .on('error', err => reject(err));
  });
};