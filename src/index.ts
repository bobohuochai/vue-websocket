import Logger from "./logger";
import IListenler from "./IListenler";
import Emitter, { EventTypeEnum } from "./emitter";
import Vue, { VueConstructor } from "vue";
import WebsocketProxy, { protocolEnum } from "./websocketProxy";
import SocketIOListenler from "./socketioListenler";
import StompListenler, { VueStomp } from "./stompListenler";

declare module "vue/types/vue" {
  interface Vue {
    $websocket: any;
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
  BROADCAST = "BROADCAST",
  DIRECTED = "DIRECTED"
}

export const EventTypeEnums = EventTypeEnum;

export default class VueWebsocket {
  public emitter: Emitter;
  public protocol: string;
  public ws: VueStomp | any;
  private logger: Logger;

  private listener: IListenler;
  private type: wsType;
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
    this.logger = new Logger();
    Logger.debug = debug;
    this.protocol = protocol;
    this.type = type;
    this.emitter = new Emitter(vuex);
    this.ws = new WebsocketProxy(this.logger, this.emitter).generatorWebsocket(
      protocol,
      connection,
      { ...options, debug }
    );

    switch (protocol) {
      case protocolEnum.SOCKETIO:
        this.listener = new SocketIOListenler(this.ws, this.emitter);
        break;
      case protocolEnum.STOMP:
        this.listener = new StompListenler(this.ws, this.emitter);
        break;
      default:
        this.listener = new StompListenler(this.ws, this.emitter);
        break;
    }
  }
  /**
   * Vuejs entrypoint
   * @param Vue
   *
   */
  public install(vc: VueConstructor) {
    vc.prototype.$websocket = this.ws;
    vc.prototype.$vueWebsocket = this;
    this.logger.info("Vue-Socket.io plugin enabled");
  }
}
