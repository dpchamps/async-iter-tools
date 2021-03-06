import { asyncIteratorFactory } from "./utils/asyncIteratorFactory";
import { iteratorResult } from "./utils/iterator-result";
import { RequiredAsyncIterableIterator } from "./utils/types";

type AI = AsyncIterator<unknown>;
type IntoAsyncGen<T extends AsyncIterator<unknown>> = T extends AsyncIterator<
  infer U
>
  ? RequiredAsyncIterableIterator<U>
  : never;

export function merge<
  T extends AI,
  U extends AI,
  V extends AI,
  W extends AI,
  X extends AI,
  Y extends AI,
  Z extends AI
>(
  it1: T,
  it2: U,
  it3: V,
  it4: W,
  it5: X,
  it6: Y,
  it7: Z
): IntoAsyncGen<T | U | V | W | X | Y | Z>;
export function merge<
  T extends AI,
  U extends AI,
  V extends AI,
  W extends AI,
  X extends AI,
  Y extends AI
>(
  it1: T,
  it2: U,
  it3: V,
  it4: W,
  it5: X,
  it6: Y
): IntoAsyncGen<T | U | V | W | X | Y>;
export function merge<
  T extends AI,
  U extends AI,
  V extends AI,
  W extends AI,
  X extends AI
>(it1: T, it2: U, it3: V, it4: W, it5: X): IntoAsyncGen<T | U | V | W | X>;
export function merge<T extends AI, U extends AI, V extends AI, W extends AI>(
  it1: T,
  it2: U,
  it3: V,
  it4: W
): IntoAsyncGen<T | U | V | W>;
export function merge<T extends AI, U extends AI, V extends AI>(
  it1: T,
  it2: U,
  it3: V
): IntoAsyncGen<T | U | V>;
export function merge<T extends AI, U extends AI>(
  it1: T,
  it2: U
): IntoAsyncGen<T | U>;
export function merge<T extends AI>(it1: T): IntoAsyncGen<T>;

export function merge(...asyncIterators: AsyncIterator<unknown>[]) {
  let done = false;
  const iteratorMap = new Map(
    asyncIterators.map((iterator) => [
      iterator,
      iterator.next().then((result) => ({
        result,
        iterator,
      })),
    ])
  );

  return {
    async next() {
      if (done) return iteratorResult(undefined, true);
      while (iteratorMap.size > 0) {
        const {
          result: { value, done },
          iterator,
        } = await Promise.race(iteratorMap.values());

        if (done) {
          iteratorMap.delete(iterator);
          continue;
        }

        iteratorMap.set(
          iterator,
          iterator.next().then((result) => ({ result, iterator }))
        );

        return iteratorResult(value, false);
      }

      return iteratorResult(undefined, true);
    },
    async throw(value?: unknown) {
      done = true;
      await Promise.allSettled(
        [...iteratorMap].map(([iter]) =>
          typeof iter.throw !== "undefined"
            ? iter.throw(value)
            : Promise.resolve()
        )
      );
      iteratorMap.clear();

      throw value;
    },
    async return<U>(value: U) {
      done = true;
      await Promise.all(
        [...iteratorMap].map(([iter]) =>
          typeof iter.return !== "undefined"
            ? iter.return(value)
            : Promise.resolve(iteratorResult(undefined, true))
        )
      );

      return iteratorResult(value, true);
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
