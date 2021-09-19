export type Awaited<T extends PromiseLike<unknown>> = T extends PromiseLike<infer U> ? U : never;

export type InferAsyncIterator<T extends AsyncIterator<unknown>> = T extends AsyncIterator<infer U> ? U : never;
