import { throws } from "./throws";
import { repeat } from "./core/repeat";
import { identity } from "./utils/fns";

describe("throws", () => {
  it("Should throw on step", async () => {
    const doThrow = throws(repeat(() => 1));
    await expect(doThrow.next()).rejects.toEqual(1);
  });

  it("Should throw on the initial iterator if present", async () => {
    const emitOne = repeat(() => 1);
    jest.spyOn(emitOne, "throw");
    const doThrow = throws(emitOne);

    await doThrow.next().catch(identity);

    expect(emitOne.throw).toHaveBeenCalled();
  });

  it("Should throw on an async iterator that has not implemented throw", async () => {
    const iter = {
      next: async () => ({
        value: 1,
        done: false,
      }),
    };

    const doThrow = throws(iter);

    await expect(doThrow.next()).rejects.toEqual(1);
  });

  it("Should throw only once", async () => {
    const doThrow = throws(repeat(() => 1));

    await expect(doThrow.next()).rejects.toEqual(1);
    await expect(doThrow.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });
  });

  it("Should transform emitted values", async () => {
    const doThrow = throws(
      repeat(() => 1),
      (x) => new Error(String(x))
    );
    await expect(doThrow.next()).rejects.toThrow(new Error(`1`));
  });
});
