import { Subscribe } from "@lbfalvy/mini-events";

/** A connection messages can be sent over.
 * - Total ordering per instance
 * - Accepts JSON
 * - Spontaneous subchanneling (links are kept alive until all channels are closed)
 */
export interface Port {
  /** Sends a message and resolves the promise upon confirmation of its arrival */
  send(message: any): Promise<void>;
  /** Sends a message without waiting for any confirmation */
  send_unsafe(message: any): void;
  /** Fired when a message is received */
  onmessage: Subscribe<[any]>;
  /** Negotiate the spawning of a subchannel */
  split(): Promise<Port>;
  /** Fired when a subchannel has been spawned by the other peer */
  onsplit: Subscribe<[Port]>;
  /** Ensure all messages were received */
  flush(): Promise<void>;
  /** Discard this port
   * This port and the one it was split from are flushed
   * Possibly other ports are also flushed, if they are in sync
   */
  close(): Promise<void>;
}
