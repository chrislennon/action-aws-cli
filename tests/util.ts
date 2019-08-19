import * as path from 'path'

export function getLocalDir(dir: string): string  {
  const localDir = path.join(
    __dirname,
    'runner',
    path.join(
      Math.random()
        .toString(36)
        .substring(7)
    ),
    dir
  )
  return localDir
}
