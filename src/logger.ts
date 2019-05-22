/**
 * shitty logger class
 */
export default class VueSocketIOLogger {
  public static debug: boolean

  private prefix: string
  constructor() {
    // VueSocketIOLogger.debug = false
    this.prefix = '%cVue-Socket.io: '
  }

  public info(text: string, data = '') {
    if (VueSocketIOLogger.debug) {
      window.console.info(
        this.prefix + `%c${text}`,
        'color: blue; font-weight: 600',
        'color: #333333',
        data
      )
    }
  }

  public error() {
    if (VueSocketIOLogger.debug) {
      window.console.error(this.prefix, ...arguments)
    }
  }

  public warn() {
    if (VueSocketIOLogger.debug) {
      window.console.warn(this.prefix, ...arguments)
    }
  }

  public event(text: string, data = '') {
    if (VueSocketIOLogger.debug) {
      window.console.info(
        this.prefix + `%c${text}`,
        'color: blue; font-weight: 600',
        'color: #333333',
        data
      )
    }
  }
}
