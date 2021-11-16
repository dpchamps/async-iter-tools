export type Deferred<T> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (err?: unknown) => void;
  promise: Promise<T>;
};

export const createDeferred = <T>(): Deferred<T> => {
  let resolve = (_value: T | PromiseLike<T>) => {};
  let reject = () => {};
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
