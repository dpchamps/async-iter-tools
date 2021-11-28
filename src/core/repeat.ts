export async function* repeat<T>(emit: () => PromiseLike<T> | T) {
  while (true) {
    yield emit();
  }
}
