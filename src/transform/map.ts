import {
  InferAsyncIterator,
  RequiredAsyncIterableIterator,
} from "../utils/types";
import { intoAsyncIterableIterator } from "../utils/intoAsyncIterableIterator";
import { iteratorResult } from "../utils/iterator-result";

export const map = <T extends AsyncIterator<any>, U>(
  it: T,
  cb: (x: InferAsyncIterator<T>) => U
): RequiredAsyncIterableIterator<U> => ({
  ...intoAsyncIterableIterator(it),
  next: async (...args: Parameters<typeof it["next"]>) => {
    const result = await it.next(...args);

    return iteratorResult(
      result.done ? result.value : cb(result.value),
      result.done ? result.done : false
    );
  },
});
