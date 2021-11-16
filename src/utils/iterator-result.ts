// This is just a helper to coerce the kind of slippery iter result interface.
export const iteratorResult = <T>(value: T, done: boolean): IteratorResult<T> =>
  done
    ? {
        value,
        done: true,
      }
    : {
        value,
        done: false,
      };
