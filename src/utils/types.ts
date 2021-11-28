export type Tuple<T> = readonly T[]
export type Tail<T extends Tuple<any>> = T extends [any, ...infer U] ? U : never;

export type InferAsyncIterator<T extends AsyncIterator<any>> =
  T extends AsyncIterator<infer U> ? U : never;

export interface TypedAsyncIterableIterator<T, TArgs = undefined> extends AsyncIterator<T, any, TArgs> {
    [Symbol.asyncIterator](): TypedAsyncIterableIterator<T, TArgs>;
}

export type RequiredAsyncIterableIterator<T, TArgs = undefined> = Required<TypedAsyncIterableIterator<T,  TArgs>>;