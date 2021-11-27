import {InferAsyncIterator, RequiredAsyncIterableIterator} from "../utility-types";
import {intoAsyncIterableIterator} from "../utils/intoAsyncIterableIterator";

export const map = <T extends AsyncIterator<any>, U>(
  it: T,
  cb: (x: InferAsyncIterator<T>) => U
): RequiredAsyncIterableIterator<U> => ({
  ...intoAsyncIterableIterator(it),
  next: async (...args: Parameters<typeof it["next"]>) => {
    const result = await it.next(...args);

    return result.done
      ? {
          done: result.done,
          value: result.value,
        }
      : {
          done: result.done,
          value: cb(result.value),
        };
  }
});
