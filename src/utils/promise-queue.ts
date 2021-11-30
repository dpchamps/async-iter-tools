import { createDeferred } from "./deferred";

interface Node<T> {
  value: T;
  tail: Promise<Node<T>>;
}

export class PromiseQueue<T> {
  private head = createDeferred<Node<T>>();
  private promises = new Set<Promise<unknown>>();

  get size() {
    return this.promises.size;
  }

  enqueue(value: T) {
    const next = createDeferred<Node<T>>();

    this.promises.add(next.promise);

    this.head.resolve({
      value,
      tail: next.promise,
    });

    this.head.resolve = next.resolve;
  }

  async dequeue() {
    const { value, tail } = await this.head.promise;

    this.head.promise = tail;
    this.promises.delete(tail);

    return value;
  }
}
