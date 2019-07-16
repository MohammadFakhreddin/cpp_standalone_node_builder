import Colors from 'colors'

export class Logger {
  public static show(message: string= '', filename: string = ''): void {
    // tslint:disable-next-line:no-console
    console.log(Colors.green(Logger.formatMessage([message, filename])))
  }
  public static log(message: string= '', filename: string = ''): void {
    const value = Logger.formatMessage([message, filename])
    // tslint:disable-next-line:no-console
    console.log(Colors.white(value))
  }
  public static error(errorText: string= '', filename: string = '', sendToAdmin: boolean= true): void {
    const value = Logger.formatMessage([JSON.stringify(errorText), filename])
    // tslint:disable-next-line:no-console
    console.log(Colors.red(value))
  }
  public static handleError(errorEvent: Error, filename: string = '', sendToAdmin: boolean = true): void {
    const message = Logger.formatMessage([errorEvent.name, errorEvent.message, errorEvent.stack || '', filename])
    // tslint:disable-next-line:no-console
    console.error(Colors.red(message))
  }
  public static formatMessage(messageList: string[]= []): string {
    let result = ''
    for (const message of messageList) {
      result += message + '\n'
    }
    return result + '\n------------------------------------------\n'
  }
}
