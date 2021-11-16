import { always } from "./always";

describe("always", () => {
  it("Should emit the supplied value", async () => {
    const iter = always(() => 1);

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
    const iter = always(() => Promise.resolve("Hey"));

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
