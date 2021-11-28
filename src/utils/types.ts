export type Awaited<T extends PromiseLike<unknown>> = T extends PromiseLike<
  infer U
>
  ? U
  : never;

export type InferAsyncIterator<T extends AsyncIterator<any>> =
  T extends AsyncIterator<infer U> ? U : never;

export interface TypedAsyncIterableIterator<T, TArgs = undefined> extends AsyncIterator<T, any, TArgs> {
    [Symbol.asyncIterator](): TypedAsyncIterableIterator<T, TArgs>;
}

export type RequiredAsyncIterableIterator<T, TArgs = undefined> = Required<TypedAsyncIterableIterator<T,  TArgs>>;