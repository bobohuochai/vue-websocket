import { Component, Vue } from "vue-property-decorator";
import { protocolEnum } from "./websocketProxy";
@Component({})
export default class WSMixin extends Vue {
  /**
   *  Assign runtime callbacks
   */
  public beforeCreate() {
    if (
      this.$vueWebsocket &&
      this.$vueWebsocket.protocol === protocolEnum.SOCKETIO
    ) {
      this.$websocket.$subscribe = (event: any, callback: any) => {
        this.$vueWebsocket.emitter.addListener(event, callback, this);
      };
      this.$websocket.$unsubscribe = (event: any) => {
        this.$vueWebsocket.emitter.removeListener(event, this);
      };
    }
  }

  /**
   * Register all socket events
   */
  public mounted() {
    if (this.$data.$socket) {
      Object.keys(this.$data.$socket).forEach(event => {
        if (event !== "subscribe" && event !== "unsubscribe") {
          this.$vueWebsocket.emitter.addListener(
            event,
            this.$data.$socket[event],
            this
          );
        }
      });
    }
    // stomp
    if (this.$data.$stomps) {
      Object.keys(this.$data.$stomps).forEach(topic => {
        this.$websocket.$subscribe(topic, this.$data.$stomps[topic], this);
      });
    }
  }

  /**
   * unsubscribe when component unmounting
   */
  public beforeDestroy() {
    if (this.$data.$socket) {
      Object.keys(this.$data.$socket).forEach(event => {
        this.$vueWebsocket.emitter.removeListener(event, this);
      });
    }

    if (this.$data.$stomps) {
      Object.keys(this.$data.$stomps).forEach(topic => {
        this.$websocket.$unsubscribe(topic, this);
      });
    }
  }
}
