export async function* intoAsyncIter<T>(iter: IterableIterator<T>) {
  for (const el of iter) {
    yield await el;
  }
}
