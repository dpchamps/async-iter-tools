export type Deferred<T> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (err?: unknown) => void;
  promise: Promise<T>;
};

export const createDeferred = <T>(): Deferred<T> => {
  let resolve = /*istanbul ignore next, reason: erased value*/ (
    _value: T | PromiseLike<T>
  ) => {};
  let reject = /*istanbul ignore next, reason: erased value*/ () => {};
  let promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    resolve,
    reject,
    promise,
  };
};
