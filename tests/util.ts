import {join} from 'path'

export function getLocalDir(dir: string): string  {
  const localDir = join(
    __dirname,
    'runner',
    join(
      Math.random()
        .toString(36)
        .substring(7)
    ),
    dir
  )
  return localDir
}
