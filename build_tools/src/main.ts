import ChildProcess from 'child_process'
import Path from 'path'
import { FileSystem } from './file_system/FileSystem'
import { Logger } from './utils/Logger'
import { CommonValidator } from './utils/RegexValidator';

const isWindows = process.platform==='win32'

const outputDirectory = Path.join(__filename,"../../../output")
const outputFileName = isWindows ? 'Main.exe' : 'a.out'
const initialCompileDirectory = Path.join(__filename, '../../../src')
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
     const child = ChildProcess.exec(command, (error, stdout, stderr) => {
      if (CommonValidator.isNullOrEmpty(error as any) === false) {
        Logger.error(error as any)
      }
      resolve()
    })
    child.stderr.pipe(process.stderr)
    child.stdout.pipe(process.stdout)
  })
}


const main = async () => {
  if(await FileSystem.checkIfExists(outputDirectory)){
    await FileSystem.unlinkDirectoryAsync(outputDirectory)
  }
  await FileSystem.mkdirAsync(outputDirectory)
  await executeCommand(`cd ${outputDirectory}`)
  await extractExecutable(initialCompileDirectory)
  {
    let buildCommand:string = ''
    if(isWindows){
      buildCommand = `cd ${outputDirectory} && cl -EHsc ${executableFiles} || cd ..`
    }else{
      buildCommand = `cd ${outputDirectory} &&  g++ -std=c++17 -stdlib=libc++ ${executableFiles} ||  cd..`
    }
    Logger.log(buildCommand)
    await executeCommand(buildCommand)
  }
  {
    let runCommand:string =  `cd output && ${isWindows ? '' : './'}${outputFileName} || cd ..`
    if(await FileSystem.checkIfExists(Path.join(outputDirectory,outputFileName))){
      Logger.show('Running program')
      await executeCommand(runCommand)
    }else{
      Logger.error('Build failed')
    }
  }
  process.exit()
}
main()
