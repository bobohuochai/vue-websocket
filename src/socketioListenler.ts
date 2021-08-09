import IListenler from './IListenler'
import EventEmitter from './emitter'

// eslint-disable-next-line no-undef
export interface VueSocketIo extends SocketIOClient.Socket {
  onevent: any
}

export default class SocketIOListenler implements IListenler {
  /**
   * socket.io-client reserved event keywords
   * @type {string[]}
   */
  private static staticEvents = [
    'connect',
    'error',
    'disconnect',
    'reconnect',
    'reconnect_attempt',
    'reconnecting',
    'reconnect_error',
    'reconnect_failed',
    'connect_error',
    'connect_timeout',
    'connecting',
    'ping',
    'pong'
  ]

  private io: VueSocketIo
  private emitter: EventEmitter

  constructor(io: VueSocketIo, emitter: EventEmitter) {
    this.io = io
    this.register()
    this.emitter = emitter
  }

  /**
   * Listening all socket.io events
   */
  public register() {
    this.io.onevent = (packet: any) => {
      const [event, ...rest] = packet.data
      let args = rest
      if (args.length === 1) {
        args = args[0]
      }
      this.onEvent(event, args)
    }
    SocketIOListenler.staticEvents.forEach(event =>
      this.io.on(event, (args: any) => this.onEvent(event, args))
    )
  }

  /**
   * Broadcast all events to vuejs environment
   */
  public onEvent(event: any, args: any) {
    this.emitter.emit(event, args)
  }
}
