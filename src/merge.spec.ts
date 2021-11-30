import { merge } from "./merge";
import { delay } from "./utils/fns";
import { callback } from "./callback";

describe("Merge Iterators", () => {
  it("Should merge a single async iterator unchanged", async () => {
    async function* fn() {
      yield 1;
    }

    const merged = merge(fn());

    await expect(merged.next()).resolves.toEqual({ value: 1, done: false });
    await expect(merged.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });
  });

  it("Should greedily merge multiple async iterators", async () => {
    async function* fn2() {
      yield "2.A";
      yield "2.B";
    }

    async function* fn3() {
      yield "3.A";
      yield "3.B";
    }

    const merged = merge(fn2(), fn3());

    await expect(merged.next()).resolves.toEqual({ value: "2.A", done: false });
    await expect(merged.next()).resolves.toEqual({ value: "2.B", done: false });
    await expect(merged.next()).resolves.toEqual({ value: "3.A", done: false });
    await expect(merged.next()).resolves.toEqual({ value: "3.B", done: false });
    await expect(merged.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });
  });

  it("Should merge async iterators first-come first-serve", async () => {
    async function* fastFn() {
      yield "A";
      await delay(5);
      yield "B";
      await delay(50);
      yield "C";
    }
    async function* slowFn() {
      yield 1;
      await delay(20);
      yield 2;
      await delay(1);
      yield 3;
    }

    const merged = merge(fastFn(), slowFn());

    await expect(merged.next()).resolves.toEqual({ value: "A", done: false });
    await expect(merged.next()).resolves.toEqual({ value: 1, done: false });
    await expect(merged.next()).resolves.toEqual({ value: "B", done: false });
    await expect(merged.next()).resolves.toEqual({ value: 2, done: false });
    await expect(merged.next()).resolves.toEqual({ value: 3, done: false });
    await expect(merged.next()).resolves.toEqual({ value: "C", done: false });
    await expect(merged.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });
  });

  it("Should cleanup supplied iterators on return", async () => {
    const slow = callback(setInterval, clearInterval, 3);
    const fast = callback(setInterval, clearInterval, 1);
    const merged = merge(slow, fast);

    await merged.return();

    await expect(slow.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });

    await expect(fast.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });
  });

  it("Should cleanup supplied iterators on throw", async () => {
    const slow = callback(setInterval, clearInterval, 3);
    const fast = callback(setInterval, clearInterval, 1);
    const merged = merge(slow, fast);

    await merged.throw().catch((e) => {});

    await expect(slow.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });

    await expect(fast.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });
  });

  it("should be iterable", async () => {
    let results = [];
    async function* fn2() {
      yield "2.A";
      yield "2.B";
    }

    async function* fn3() {
      yield "3.A";
      yield "3.B";
    }

    const merged = merge(fn2(), fn3());

    for await (const value of merged) {
      results.push(value);
    }

    expect(results).toEqual(["2.A", "3.A", "2.B", "3.B"]);
  });

  it("Should not continue to iterator after return has been called", async () => {
    const slow = callback(setInterval, clearInterval, 3);
    const fast = callback(setInterval, clearInterval, 1);
    const merged = merge(slow, fast);

    await merged.return();

    await expect(merged.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });
  });

  it("It should handle return with partial iterables", async () => {
    const iterable = () => ({
      async next() {
        return {
          value: undefined,
          done: false,
        };
      },
    });

    const x = merge(iterable());
    const { value } = await x.return("value");

    expect(value).toEqual("value");
  });

  it("It should handle throw with partial iterables", async () => {
    const iterable = () => ({
      async next() {
        return {
          value: undefined,
          done: false,
        };
      },
    });

    const x = merge(iterable());

    await expect(x.throw("value")).rejects.toEqual("value");
  });
});
