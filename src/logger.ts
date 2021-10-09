/**
 * shitty logger class
 */
export default class VueSocketIOLogger {
   static debug: boolean

   prefix: string
  constructor() {
    // VueSocketIOLogger.debug = false
    this.prefix = '%cVue-Socket.io: '
  }

   info(text: string, data = '') {
    if (VueSocketIOLogger.debug) {
      window.console.info(
        this.prefix + `%c${text}`,
        'color: blue; font-weight: 600',
        'color: #333333',
        data
      )
    }
  }

   error() {
    if (VueSocketIOLogger.debug) {
      window.console.error(this.prefix, ...arguments)
    }
  }

   warn() {
    if (VueSocketIOLogger.debug) {
      window.console.warn(this.prefix, ...arguments)
    }
  }

   event(text: string, data = '') {
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
