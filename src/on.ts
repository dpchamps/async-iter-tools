import EventEmitter from "events";
import { PromiseQueue } from "./utils/promise-queue";
import { iteratorResult } from "./utils/iterator-result";

type HandlerOf<T extends EventEmitter> = Parameters<T["on"]>[1];
export const on = <T extends EventEmitter>(
  ee: T,
  event: string
): Required<AsyncIterableIterator<Parameters<Parameters<typeof ee.on>[1]>>> => {
  const queue = new PromiseQueue<Parameters<Parameters<typeof ee.on>[1]>>();
  const eventHandler: HandlerOf<T> = (...args) => {
    queue.enqueue(args);
  };
  let done = false;
  const cleanup = () => {
    done = true;
    ee.off(event, eventHandler);
    debugger;
  };

  ee.on(event, eventHandler);

  return {
    async next() {
      if (done)
        return iteratorResult(
          undefined,
          true
        ) as IteratorReturnResult<undefined>;
      const value = await queue.dequeue();
      return iteratorResult(value, false);
    },
    async throw(e?: unknown) {
      cleanup();
      throw e;
    },
    async return(value?) {
      cleanup();
      return iteratorResult(value, true);
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
};
