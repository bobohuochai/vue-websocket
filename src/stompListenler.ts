import IListenler from "./IListenler";
import EventEmitter, { EventTypeEnum } from "./emitter";
import { Client, Message } from "@stomp/stompjs";

export interface VueStomp extends Client {
  $subscribe: (
    topic: string,
    event: (...args: any[]) => void,
    component: any
  ) => any;
  $unsubscribe: (topic: string, ...args: any) => void;
}

export default class StompListenler implements IListenler {
  /**
   * socket.io-client reserved event keywords
   * @type {string[]}
   */
  private static staticEvents = [];

  private stomp: VueStomp;
  private emitter: EventEmitter;
  private subscriptions: Map<string, any[]>;

  constructor(stomp: VueStomp, emitter: EventEmitter) {
    this.stomp = stomp;
    this.emitter = emitter;
    this.subscriptions = new Map();
    this.register();
  }

  /**
   * Listening all socket.io events
   */
  public register() {
    this.stomp.$subscribe = this.subscribe.bind(this);
    this.stomp.$unsubscribe = this.unsubscribe.bind(this);
    this.emitter.ev_on(EventTypeEnum.CONNECTED, this.onConnected.bind(this));
  }

  /**
   * Broadcast all events to vuejs environment
   */
  public onEvent(event: any, args: any) {
    this.emitter.emit(event, args);
  }
  /**
   *
   * @param eventName
   * @param args
   * connected event
   */
  public onConnected(eventName: string, args: any) {
    this.subscriptions.forEach((items: any[], topic: string) => {
      items.forEach((item: any) => {
        const subscription = this.stomp.subscribe(topic, item.event);
        item.subscription = subscription;
        console.log(
          ` connected #${topic} subscribe, component: ${item.component.$options.name}`
        );
      });
    });
  }

  private subscribe(topic: string, event: any, component: any) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }
    /**
     * 等待ws 连接完成后，开始订阅
     */
    if (this.stomp.connected) {
      const subscription: any = this.stomp.subscribe(topic, event);
      (this.subscriptions.get(topic) as any[]).push({
        event,
        component,
        subscription
      });
    } else {
      (this.subscriptions.get(topic) as any[]).push({ event, component });
    }
  }

  private unsubscribe(topic: string, callback: any, component: any) {
    //this.stomp.unsubscribe(topic);
    if (this.subscriptions.has(topic)) {
      const selectedSubscriptions = (this.subscriptions.get(
        topic
      ) as any[]).filter(
        (item: any) => item.component === component && item.event === callback
      );

      selectedSubscriptions.forEach((item: any) => {
        item.subscription && item.subscription.unsubscribe();
        console.log(
          `#${topic} unsubscribe, component: ${component.$options.name},callback: ${callback}`
        );
      });
      const filterSubscriptions = (this.subscriptions.get(
        topic
      ) as any[]).filter(
        (item: any) => item.component !== component || item.event !== callback
      );

      if (filterSubscriptions.length > 0) {
        this.subscriptions.set(topic, filterSubscriptions);
      } else {
        this.subscriptions.delete(topic);
        this.stomp.unsubscribe(topic);
      }
    }
  }
}
