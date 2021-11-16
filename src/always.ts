export async function* always<T>(emit: () => PromiseLike<T> | T) {
  while (true) {
    yield emit();
  }
}
