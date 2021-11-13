interface InvertedIterator<T> {
  next: (v: T) => void;
  return: (v?: T) => void;
  throw: (reason?: unknown) => void;
}

export const pushToPull = <T>(
  onIterationStep: (cf: InvertedIterator<T>) => void
) => {
  let res = /*  istanbul ignore next */ (
    _: IteratorResult<T> | PromiseLike<IteratorResult<T>>
  ) => {};
  let rej = /*  istanbul ignore next */ (_?: unknown) => {};

  onIterationStep({
    next: (value) => res({ value, done: false }),
    return: (value) => res({ value, done: true }),
    throw: (e?: any) => rej(e),
  });

  return (async function* () : AsyncGenerator<T, undefined, unknown> {
    while (true) {
      try {
        const { value, done } = await new Promise<IteratorResult<T>>(
            (resolve, reject) => {
              res = resolve;
              rej = reject;
            }
        );

        yield value;

        if (done) return;
      } catch (e) {
        throw e;
      }
    }
  })();
}
