import Fs from 'fs'
import Path from 'path'
import {
  IFileProcessSuccessResult,
  IFileSystemRenameResult,
  IFileSystemResult,
  IReaddirAsyncResult,
  IUnlinkIfExistsResult
} from './IFileSystem'

export class FileSystem {
  public static writeAsync(path: Fs.PathLike, value: string): Promise<IFileSystemResult> {
    return new Promise((resolve) => {
      Fs.writeFile(path, value, (err: NodeJS.ErrnoException) => {
        resolve({
          err,
          res: true
        })
      })
    })
  }
  public static unlinkAsync(path: Fs.PathLike): Promise<IFileSystemResult> {
    return new Promise((resolve) => {
      Fs.unlink(path, (err) => resolve({err}))
    })
  }
  public static rmDirAsync(path: string): Promise<IFileSystemResult> {
    return new Promise((resolve) => {
      Fs.rmdir(path, (err) => resolve({err}))
    })
  }
  public static renameAsync(oldPath: string, newPath: string): Promise<IFileSystemRenameResult> {
    return new Promise((resolve) => {
      Fs.rename(oldPath, newPath, (err) => resolve({err}))
    })
  }
  public static readdirAsync(
    path: string,
    options?: { encoding?: string | null } | string | undefined | null
  ): Promise<IReaddirAsyncResult> {
    return new Promise((resolve) => {
      Fs.readdir(path, options, (err, files) => resolve({err, res: files as string[]}))
    })
  }
  public static checkIfExists(path: Fs.PathLike): Promise<boolean> {
    return new Promise((resolve) => {
      Fs.exists(path, (exists) => resolve(exists))
    })
  }
  public static unlinkIfExistsAsync(path: string): Promise<IUnlinkIfExistsResult> {
    return new Promise(async (resolve) => {
      const exists = await FileSystem.checkIfExists(path)
      if (exists === false) {
        resolve({err: null, res: false})
        return
      }
      const unlinkResult = await FileSystem.unlinkAsync(path)
      resolve({res: unlinkResult.res, err: unlinkResult.err})
    })
  }
  public static cpAsync(path: string, newPath: string): Promise<IFileProcessSuccessResult> {
    return new Promise((resolve) => {
      Fs.copyFile(path, newPath, (err) => {
        resolve({
          err,
          res: err == null ? true : false
        })
      })
    })
  }
  public static mkdirAsync(path: string): Promise<IFileProcessSuccessResult> {
    return new Promise((resolve) => {
      Fs.mkdir(path, (err) => {
        resolve({
          err,
          res: err === null ? true : false
        })
      })
    })
  }
  public static lstatAsync(path: string): Promise<IFileSystemResult> {
    return new Promise((resolve) => {
      Fs.lstat(path, (err, res) => resolve({err, res}))
    })
  }
  public static cpIfExistsAsync(path: string, newPath: string): Promise<IFileProcessSuccessResult> {
    return new Promise(async (resolve) => {
      const exists = await FileSystem.checkIfExists(path)
      if (exists === false) {
        resolve({
          err: null,
          res: false
        })
        return
      }
      resolve(await FileSystem.cpAsync(path, newPath))
    })
  }
  public static cpDirectoryAsync(path: string, newPath: string): Promise<IFileProcessSuccessResult> {
    return new Promise(async (resolve) => {
      const readEntries = await FileSystem.readdirAsync(path)
      if (readEntries.err) {
        return resolve({
          res: false,
          err: readEntries.err
        })
      }
      const mkdirResult = await FileSystem.mkdirAsync(newPath)
      if (mkdirResult.err) {
        return resolve({
          res: false,
          err: mkdirResult.err
        })
      }
      for (const entry of readEntries.res) {
        const srcPath = Path.join(path, entry)
        const destPath = Path.join(newPath, entry)
        const findLStatsResult = await FileSystem.lstatAsync(srcPath)
        if (findLStatsResult.err) {
          return resolve({
            err: findLStatsResult.err,
            res: false
          })
        }
        if (findLStatsResult.res.isDirectory()) {
          const cpDirResult = await FileSystem.cpDirectoryAsync(srcPath, destPath)
          if (cpDirResult.err) {
            return resolve({
              err: cpDirResult.err,
              res: false
            })
          }
        } else {
          const cpFileResult = await FileSystem.cpAsync(srcPath, destPath)
          if (cpFileResult.err) {
            return resolve({
              err: cpFileResult.err,
              res: false
            })
          }
        }
      }
      resolve({
        err: null,
        res: true
      })
    })
  }
  public static unlinkDirectoryAsync(path: string): Promise<IFileProcessSuccessResult> {
    return new Promise(async (resolve) => {
      const readEntries = await FileSystem.readdirAsync(path)
      if (readEntries.err) {
        return resolve({
          res: false,
          err: readEntries.err
        })
      }
      for (const entry of readEntries.res) {
        const srcPath = Path.join(path, entry)
        const findLStatsResult = await FileSystem.lstatAsync(srcPath)
        if (findLStatsResult.err) {
          return resolve({
            err: findLStatsResult.err,
            res: false
          })
        }
        if (findLStatsResult.res.isDirectory()) {
          const cpDirResult = await FileSystem.unlinkDirectoryAsync(srcPath)
          if (cpDirResult.err) {
            return resolve({
              err: cpDirResult.err,
              res: false
            })
          }
        } else {
          const cpFileResult = await FileSystem.unlinkAsync(srcPath)
          if (cpFileResult.err) {
            return resolve({
              err: cpFileResult.err,
              res: false
            })
          }
        }
      }
      const unlinkRootResult = await FileSystem.rmDirAsync(path)
      if (unlinkRootResult.err) {
        return resolve({
          err: unlinkRootResult.err,
          res: false
        })
      }
      return resolve({
        err: null,
        res: true
      })
    })
  }
  public static extractExtensionFromPathOrUrl(path: string): string  {
    const slicedPath = path.split('.')
    if (slicedPath.length < 2) {
      return ''
    }
    return '.'.concat(slicedPath.pop())
  }
}
