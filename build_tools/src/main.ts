import ChildProcess from 'child_process'
import Path from 'path'
import { FileSystem } from './file_system/FileSystem'
import { Logger } from './utils/Logger'
import { CommonValidator } from './utils/RegexValidator'

const initialCompileDirectory = Path.join(__filename, '../../../src')
const executableFileName = 'a.out'
let executableFiles: string = ''
const extractExecutable = (path: string) => {
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
        await extractExecutable(srcPath)
      } else {
        const extension = FileSystem.extractExtensionFromPathOrUrl(srcPath)
        if (extension === '.cpp' || extension === '.c') {
          executableFiles += ` ${srcPath} `
        }
      }
    }
    resolve({
      err: null,
      res: true
    })
  })
}

const executeCommand = (command: string) => {
  return new Promise((resolve) => {
    ChildProcess.exec(command, (error, stdout, stderr) => {
      if (CommonValidator.isNullOrEmpty(error as any) === false) {
        Logger.error(error as any)
      }
      if (CommonValidator.isNullOrEmpty(stderr) === false) {
        Logger.log(stderr)
      }
      if (CommonValidator.isNullOrEmpty(stdout) === false) {
        Logger.log(stdout)
      }
      resolve()
    })
  })
}

const main = async () => {
  if (await FileSystem.checkIfExists(executableFileName)) {
    await executeCommand(`rm -r ${executableFileName}`)
  }
  await extractExecutable(initialCompileDirectory)
  const buildCommand = `g++ -std=c++17 -stdlib=libc++ ${executableFiles}`
  Logger.log(buildCommand)
  await executeCommand(buildCommand)
  process.exit()
}
main()
