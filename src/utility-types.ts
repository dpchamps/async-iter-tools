export type Awaited<T extends PromiseLike<unknown>> = T extends PromiseLike<infer U> ? U : never;
