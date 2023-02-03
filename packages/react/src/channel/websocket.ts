import { Port } from "./types.js";
import ev from "@lbfalvy/mini-events";


export function websocketPort(ws: WebSocket): Port {
  const [recvPlug, recv] = ev.event<[string]>();
  const [closePlug, close] = ev.event<[]>();
  ws.addEventListener("message", ev => recvPlug(ev.data));
  ws.addEventListener("close", ev => closePlug());
  let nextns = 0;
  let liveConnections = 0;
  let [setPending, pending] = ev.variable(0);
  const startPending = () => setPending(pending.get() + 1);
  const endPending = () => setPending(pending.get() - 1);
  function mkPort(): Port {
    const ns = nextns++;
    return {
      
    }
  }
}