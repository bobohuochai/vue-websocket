import Logger from "./logger";
import SocketIO from "socket.io-client";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import EventEmitter, { EventTypeEnum } from "./emitter";

export enum protocolEnum {
  SOCKETIO = "SOCKETIO",
  STOMP = "STOMP"
}

export default class WebsocketProxy {
  private logger: Logger;
  private eventEmitter: EventEmitter;
  constructor(logger: Logger, eventEmitter: EventEmitter) {
    this.logger = logger;
    this.eventEmitter = eventEmitter;
  }
  public generatorWebsocket(
    protocol: string,
    connection: any,
    options?: any
  ): any {
    switch (protocol) {
      case protocolEnum.SOCKETIO:
        return this.createSocketIO(connection);
        break;
      case protocolEnum.STOMP:
        return this.createStomp(connection, options);
        break;
    }
  }

  /**
   * registering socketio instance
   * @param connection
   */
  private createSocketIO(connection: any): SocketIOClient.Socket {
    if (connection && typeof connection === "object") {
      this.logger.info("Received socket.io-client instance");

      return connection;
    } else if (typeof connection === "string") {
      this.logger.info("Received connection string");

      return SocketIO(connection, { transports: ["websocket"] });
    } else {
      throw new Error("Unsupported connection type");
    }
  }

  /**
   * registering stomp instance
   * @param connection
   */
  private createStomp(connection: any, options: any): Stomp.Client {
    if (connection && typeof connection === "object") {
      this.logger.info("Received stomp client instance");

      return connection;
    } else if (typeof connection === "string") {
      this.logger.info("Received connection string");
      const socket = new SockJS(connection);
      const stompClient = Stomp.over(socket);
      let headers = null;
      if (options) {
        headers = options.headers;
      }
      stompClient.connect(
        headers ? headers : {},
        (frame: any) => {
          this.logger.info("stomp Connected: " + frame);
          this.eventEmitter.ev_emit(EventTypeEnum.CONNECTED);
        },
        (error: string | Stomp.Frame) => {
          this.logger.error();
        }
      );
      // 重写debug 方法 避免在生产环境中产生log
      stompClient.debug = (str: string) => {
        console.log(str);
      };
      this.logger.info("created stomp client");
      return stompClient;
    } else {
      throw new Error("Unsupported connection type");
    }
  }
}
