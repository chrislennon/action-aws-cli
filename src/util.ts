export function _filterVersion(stdmsg: string): string {
  const cliVersion = stdmsg.match('(\\d+\\.)(\\d+\\.)(\\d+)')
  if (cliVersion) return cliVersion[0]
  else return '0.0.0'
}
