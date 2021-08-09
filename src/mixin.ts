
/* eslint-disabled */
import { protocolEnum } from './websocketProxy'

const mixin = {
  /**
   *  Assign runtime callbacks
   */
  beforeCreate() {
    if (
      this.$vueWebsocket &&
      this.$vueWebsocket.protocol === protocolEnum.SOCKETIO
    ) {
      this.$websocket.$subscribe = (event: any, callback: any) => {
        this.$vueWebsocket.emitter.addListener(event, callback, this)
      }
      this.$websocket.$unsubscribe = (event: any) => {
        this.$vueWebsocket.emitter.removeListener(event, this)
      }
    }
  },

  /**
   * Register all socket events
   */
  mounted() {
    if (this.$data.$socket) {
      Object.keys(this.$data.$socket).forEach(event => {
        if (event !== 'subscribe' && event !== 'unsubscribe') {
          this.$vueWebsocket.emitter.addListener(
            event,
            this.$data.$socket[event],
            this
          )
        }
      })
    }
    // stomp
    if (this.$data.$stomps) {
      Object.keys(this.$data.$stomps).forEach(topic => {
        this.$websocket.$subscribe(topic, this.$data.$stomps[topic], this)
      })
    }
  },

  /**
   * unsubscribe when component unmounting
   */
  beforeDestroy() {
    if (this.$data.$socket) {
      Object.keys(this.$data.$socket).forEach(event => {
        this.$vueWebsocket.emitter.removeListener(event, this)
      })
    }

    if (this.$data.$stomps) {
      Object.keys(this.$data.$stomps).forEach(topic => {
        this.$websocket.$unsubscribe(topic, this.$data.$stomps[topic], this)
      })
    }
  }
} as any

export default mixin
