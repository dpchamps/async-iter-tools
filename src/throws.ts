import { error, identity } from "./utils/fns";

export async function* throws<T>(
  iter: AsyncIterator<T>,
  transformer: (e: unknown) => unknown = identity
) {
  await iter
    .next()
    .then(({ value }) =>
      typeof iter.throw !== "undefined"
        ? iter.throw(transformer(value))
        : error(transformer(value))
    );
}
