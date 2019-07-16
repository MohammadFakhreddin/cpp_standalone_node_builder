// TODO Refactor and get rid of joy as library,It is no longer needed
export class CommonValidator {
  public static isNullOrEmpty(value: string | number): boolean {
    if (value == null) {
      return true
    }
    if (typeof value === 'string') {
      return(String(value).trim() === '' || String(value).trim() === 'null' || String(value).trim() === 'undefined')
    }
    if (typeof value === 'number') {
      return false
    }
    return true
  }
  public static isInValidFolderName(value: string): boolean {
    if (CommonValidator.isNullOrEmpty(value)) {
      return true
    }
    const trimmedStringValue = String(value).trim()
    return trimmedStringValue === '..' || trimmedStringValue === '.'
  }
  public static isEmptyArray(value: any[]): boolean {
    return (CommonValidator.isArray(value) === false || value.length === 0)
  }
  public static compareArray(array1: any[], array2: any[]): boolean {
    if (array1 == null) {
      if (array2 == null) {
        return true
      }
      return false
    }
    if (array1.length !== array2.length) {
      return false
    }
    for (const currentSearchValue of array1)  {
      if (array2.filter((value) => value === currentSearchValue).length === 0) {
        return false
      }
    }
    return true
  }
  public static isEmptyMap(value: Map<any, any>): boolean {
    return (value == null || value.size === 0)
  }
  public static isArray(value: any): boolean {// For server only cause of mongodb arrays
    return value != null && value.length != null
  }
  // TODO Use this method for all comparisons
  public static compareString(string1: string, string2: string): boolean {
    return String(string1).trim() === String(string2).trim()
  }
  public static isValidDate(value: Date): boolean {
    return value instanceof Date && !isNaN(value.getTime())
  }
  public static isValidObjectId(value: string): boolean {
    if (value.match(/^[0-9a-fA-F]{24}$/)) {
      return true
    }
    return false
  }
  public static isZeroOrEmptyNumber(value: number): boolean {
    if (CommonValidator.isNumber(value) === false || value === 0) {
      return true
    }
    return false
  }
  public static isNumber(value: number): boolean {
    if (value == null || typeof value !== 'number') {
      return false
    }
    return true
  }
  public static isValidStringValue(input: string, validValues: string[]): boolean {
    if (CommonValidator.isNullOrEmpty(input)) {
      return false
    }
    input = String(input).trim()
    for (const validValue of validValues) {
      if (String(input) === String(validValue)) {
        return true
      }
    }
    return false
  }
}
