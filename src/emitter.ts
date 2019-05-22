import Logger from "./logger";
import EventEmitter3 from "eventemitter3";
export enum EventTypeEnum {
  CONNECTED = "conencted",
  ERROR = "error"
}
export type EventFn = (...arg: any[]) => any;
export default class EventEmitter {
  public eventEmitter: EventEmitter3;
  private logger: Logger;
  private store: any;
  private actionPrefix?: string;
  private mutationPrefix?: string;
  private listeners: any;
  constructor(vuex: any) {
    this.logger = new Logger();
    this.logger.info(vuex ? `Vuex adapter enabled` : `Vuex adapter disabled`);

    if (vuex) {
      this.store = vuex.store;
      this.actionPrefix = vuex.actionPrefix ? vuex.actionPrefix : "WS_ACTION";
      this.mutationPrefix = vuex.mutationPrefix
        ? vuex.mutationPrefix
        : "WS_MUTATION";
    }

    this.listeners = new Map();
    this.eventEmitter = new EventEmitter3();
  }

  /**
   * register new event listener with vuejs component instance
   * @param event
   * @param callback
   * @param component
   */
  public addListener(event: any, callback: () => any, component: any) {
    if (typeof callback === "function") {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push({ callback, component });

      this.logger.info(
        `#${event} subscribe, component: ${component.$options.name}`
      );
    } else {
      throw new Error(`callback must be a function`);
    }
  }

  /**
   * remove a listenler
   * @param event
   * @param component
   */
  public removeListener(event: any, component: any) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners
        .get(event)
        .filter((listener: any) => listener.component !== component);

      if (listeners.length > 0) {
        this.listeners.set(event, listeners);
      } else {
        this.listeners.delete(event);
      }

      this.logger.info(
        `#${event} unsubscribe, component: ${component.$options.name}`
      );
    }
  }

  /**
   * broadcast incoming event to components
   * @param event
   * @param args
   */
  public emit(event: any, args: any) {
    if (this.listeners.has(event)) {
      this.logger.info(`Broadcasting: #${event}, Data:`, args);

      this.listeners.get(event).forEach((listener: any) => {
        listener.callback.call(listener.component, args);
      });
    }

    this.dispatchStore(event, args);
  }
  /**
   *
   * @param eventName
   * @param args
   *  eventemitter3
   */
  public ev_emit(eventName: string, ...args: any[]) {
    this.eventEmitter.emit(eventName, eventName, ...args);
  }

  /***
   * eventemitter3
   */
  public ev_on(eventName: string, fn: EventFn) {
    this.eventEmitter.on(eventName, (eventName, ...arg: any[]) =>
      fn(eventName, ...arg)
    );
  }

  /**
   * dispatching vuex actions
   * @param event
   * @param args
   */
  public dispatchStore(event: any, args: any) {
    if (this.store && this.store._actions) {
      for (const prop in this.store._actions) {
        if (this.store._actions.hasOwnProperty(prop)) {
          const action = prop.split("/").pop();
          if (action === this.actionPrefix + event) {
            this.logger.info(`Dispatching Action: ${prop}, Data:`, args);
            this.store.dispatch(prop, args);
          }
        }
      }

      if (this.mutationPrefix) {
        for (const prop in this.store._mutations) {
          if (this.store._mutations.hasOwnProperty(prop)) {
            const mutation = prop.split("/").pop();
            if (mutation === this.mutationPrefix + event) {
              this.logger.info(`Commiting Mutation:${prop},Data:`, args);
              this.store.commit(prop, args);
            }
          }
        }
      }
    }
  }
}
