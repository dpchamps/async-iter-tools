import { iteratorResult } from "./iterator-result";
import {
  RequiredAsyncIterableIterator,
  TypedAsyncIterableIterator,
} from "./types";

interface FactoryArgs<T, U = undefined> {
  onNext: (...args: [] | [U]) => Promise<T>;
  cleanup: () => void | Promise<void>;
}

export const asyncIteratorFactory = <T, U = any, V = undefined>(
  factoryArgs: FactoryArgs<T>
): RequiredAsyncIterableIterator<T> => {
  let done = false;
  const config = factoryArgs;

  const cleanup = async () => {
    done = true;
    await config.cleanup();
  };

  return {
    async next(...args) {
      if (done)
        return iteratorResult(
          undefined,
          true
        ) as IteratorReturnResult<undefined>;

      return iteratorResult(await config.onNext(...args), false);
    },

    async throw(e?: unknown) {
      await cleanup();
      throw e;
    },

    async return(value?) {
      await cleanup();
      return iteratorResult(value, true);
    },

    [Symbol.asyncIterator]() {
      return this;
    },
  };
};
