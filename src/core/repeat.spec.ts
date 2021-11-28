import { repeat } from "./repeat";

describe("always", () => {
  it("Should emit the supplied value", async () => {
    const iter = repeat(() => 1);

    await expect(iter.next()).resolves.toEqual({
      value: 1,
      done: false,
    });
    await expect(iter.next()).resolves.toEqual({
      value: 1,
      done: false,
    });
    await expect(iter.next()).resolves.toEqual({
      value: 1,
      done: false,
    });
  });

  it("Should emit promises", async () => {
    const iter = repeat(() => Promise.resolve("Hey"));

    await expect(iter.next()).resolves.toEqual({
      value: "Hey",
      done: false,
    });
    await expect(iter.next()).resolves.toEqual({
      value: "Hey",
      done: false,
    });
    await expect(iter.next()).resolves.toEqual({
      value: "Hey",
      done: false,
    });
  });
});
