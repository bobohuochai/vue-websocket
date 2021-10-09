import Logger from './logger'
import IListenler from './IListenler'
import Emitter, { EventTypeEnum } from './emitter'
import Vue, { App } from 'vue'
import WebsocketProxy, { protocolEnum } from './websocketProxy'
import SocketIOListenler, { VueSocketIo } from './socketioListenler'
import StompListenler, { VueStomp } from './stompListenler'
import { Client } from '@stomp/stompjs'
import mixin from './mixin'



declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // eslint-disable-next-line no-undef
    $websocket: SocketIOClient.Socket | Client;
    $vueWebsocket: VueWebsocket;
  }
}


interface ISocketVueOptions {
  connection: string | object | any;
  vuex?: any;
  debug: boolean;
  protocol?: string;
  type?: wsType;
  options?: any;
}

export enum wsType {
  BROADCAST = 'BROADCAST',
  DIRECTED = 'DIRECTED'
}

export const EventTypeEnums = EventTypeEnum

export default class VueWebsocket {
   emitter: Emitter;
   protocol: string;
  // eslint-disable-next-line no-undef
   ws: SocketIOClient.Socket | Client;
   logger: Logger;

   listener: IListenler;
   type: wsType;
  /**
   * lets take all resource
   * @param io
   * @param vuex
   * @param debug
   */
  constructor({
    connection,
    vuex,
    debug,
    options,
    protocol = protocolEnum.SOCKETIO,
    type = wsType.BROADCAST
  }: ISocketVueOptions) {
    this.logger = new Logger()
    Logger.debug = debug
    this.protocol = protocol
    this.type = type
    this.emitter = new Emitter(vuex)
    this.ws = new WebsocketProxy(this.logger, this.emitter).generatorWebsocket(
      protocol,
      connection,
      { ...options, debug }
    )

    switch (protocol) {
      case protocolEnum.SOCKETIO:
        this.listener = new SocketIOListenler(this.ws as VueSocketIo, this.emitter)
        break
      case protocolEnum.STOMP:
        this.listener = new StompListenler(this.ws as VueStomp, this.emitter)
        break
      default:
        this.listener = new StompListenler(this.ws as VueStomp, this.emitter)
        break
    }
  }
  /**
   * Vuejs entrypoint
   * @param Vue
   *
   */
   install(app: App) {
    app.config.globalProperties.$websocket = this.ws
    app.config.globalProperties.$vueWebsocket = this
    this.logger.info('Vue-Socket.io plugin enabled')
    app.mixin({
      ...mixin
    })
  }
}
