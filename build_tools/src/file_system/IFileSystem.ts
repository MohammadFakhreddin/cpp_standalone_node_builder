export interface IFileSystemResult {
  err?: NodeJS.ErrnoException,
  res?: any
}

export interface IFileSystemRenameResult {
  err?: NodeJS.ErrnoException
}

export interface IUnlinkIfExistsResult extends IFileSystemResult {
  res: boolean
}

export interface IFileProcessSuccessResult extends IFileSystemResult {
  res: boolean
}

export interface IReaddirAsyncResult extends IFileSystemResult {
  res: string[]
}
