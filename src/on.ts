import EventEmitter from "events";
import {callback} from "./callback";

type HandlerOf<T extends EventEmitter> = Parameters<T["on"]>[1];

export const on = <T extends EventEmitter>(
  ee: T,
  event: string
) => callback(
    (handler: HandlerOf<T>) => {
      ee.on(event, handler)
      return handler
    },
    (handler) => ee.off(event, handler)
);