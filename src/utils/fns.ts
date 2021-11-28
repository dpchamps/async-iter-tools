export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const noop = () => {};

export const identity = <T>(x: T) => x;

export const error = (e: unknown) => {
  throw e;
};
