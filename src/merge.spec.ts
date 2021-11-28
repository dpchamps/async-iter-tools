import { merge } from "./merge";
import { delay } from "./utils/fns";

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
});
