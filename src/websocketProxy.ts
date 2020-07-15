import Logger from "./logger";
import SocketIO from "socket.io-client";
import SockJS from "sockjs-client";
import EventEmitter, { EventTypeEnum } from "./emitter";
import { Client, Message } from "@stomp/stompjs";

export enum protocolEnum {
  SOCKETIO = "SOCKETIO",
  STOMP = "STOMP"
}

export default class WebsocketProxy {
  private logger: Logger;
  private eventEmitter: EventEmitter;

  private socket: WebSocket | null = null;

  private stompClient: Client | null = null;

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
        return this.createStompClient(connection, options);
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
   * reconnect
   */
  // reconnect(connection: string, options: any) {
  //   let headers: any = null;
  //   if (options) {
  //     headers = options.headers;
  //   }
  //   let retryCount = 3;
  //   const timeGaps = 1000;
  //   let connected = false;
  //   let reconInv = setInterval(() => {
  //     this.socket = new SockJS(connection);
  //     this.stompClient = Stomp.over(this.socket);
  //     this.stompClient.connect(
  //       headers ? headers : {},
  //       frame => {
  //         clearInterval(reconInv);
  //         connected = true;
  //         this.logger.info("stomp Reconnected: " + frame);
  //         this.eventEmitter.ev_emit(EventTypeEnum.RECONNECTED);
  //       },
  //       () => {
  //         if (connected) {
  //           this.reconnect(connection, options);
  //         }
  //       }
  //     );
  //   }, timeGaps);
  // }

  /**
   * registering stomp instance
   * @param connection
   */
  // private createStomp(connection: any, options: any): Stomp.Client {
  //   if (connection && typeof connection === "object") {
  //     this.logger.info("Received stomp client instance");

  //     return connection;
  //   } else if (typeof connection === "string") {
  //     this.logger.info("Received connection string");
  //     this.socket = new SockJS(connection);
  //     this.stompClient = Stomp.over(this.socket);
  //     let headers = null;
  //     if (options) {
  //       headers = options.headers;
  //     }
  //     this.stompClient.connect(
  //       headers ? headers : {},
  //       (frame: any) => {
  //         this.logger.info("stomp Connected: " + frame);
  //         this.eventEmitter.ev_emit(EventTypeEnum.CONNECTED);
  //       },
  //       (error: string | Stomp.Frame) => {
  //         this.logger.error();
  //         this.reconnect(connection, options);
  //       }
  //     );
  //     // 重写debug 方法 避免在生产环境中产生log
  //     this.stompClient.debug = (str: string) => {
  //       console.log(str);
  //     };
  //     this.logger.info("created stomp client");
  //     return this.stompClient;
  //   } else {
  //     throw new Error("Unsupported connection type");
  //   }
  // }

  /**
   *  stompjs v5
   */
  private createStompClient(connection: string, options: any = {}) {
    const { headers, reconnectDelay, connectTimeout, ...rest } = options;

    this.stompClient = new Client({
      brokerURL: connection,
      connectHeaders: headers ? headers : {},
      debug: function(str) {
        console.log(str);
      },
      reconnectDelay: reconnectDelay ? reconnectDelay : 5000,
      ...rest
    });

    // Fallback code
    // For SockJS you need to set a factory that creates a new SockJS instance
    // to be used for each (re)connect
    this.stompClient.webSocketFactory = function() {
      // Note that the URL is different from the WebSocket URL
      return new SockJS(connection);
    };

    let connectTimeoutHandler: any;

    this.stompClient.beforeConnect = () => {
      const self = this;
      // Callback, invoked on before a connection to the STOMP broker.
      if (!connectTimeoutHandler) {
        connectTimeoutHandler = setTimeout(
          function() {
            console.log("stomp connect timeout:", new Date());
            (self.stompClient as Client).deactivate();
            clearTimeout(connectTimeoutHandler);
          },
          connectTimeout ? connectTimeout : 5 * 1000 * 60
        );
      }
    };

    this.stompClient.onConnect = (frame: any) => {
      // Do something, all subscribes must be done is this callback
      // This is needed because this will be executed after a (re)connect
      this.logger.info("stomp Connected: " + frame);
      clearTimeout(connectTimeoutHandler);
      this.eventEmitter.ev_emit(EventTypeEnum.CONNECTED);
    };

    this.stompClient.onDisconnect = (frame: any) => {
      this.logger.info("stomp disconnected:" + frame);
      clearTimeout(connectTimeoutHandler);
    };

    this.stompClient.onStompError = function(frame: any) {
      // Will be invoked in case of error encountered at Broker
      // Bad login/passcode typically will cause an error
      // Complaint brokers will set `message` header with a brief message. Body may contain details.
      // Compliant brokers will terminate the connection after any error
      console.log("Broker reported error: " + frame.headers["message"]);
      console.log("Additional details: " + frame.body);
    };
    // 重写debug 方法 避免在生产环境中产生log
    this.stompClient.debug = (str: string) => {
      console.log(str);
    };

    this.stompClient.activate();
    return this.stompClient;
  }
}
