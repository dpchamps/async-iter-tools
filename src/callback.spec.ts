import {callback} from "./callback";
import {delay} from "./utils/fns";
import {map} from "./transform/map";
import {clearTimeout} from "timers";

describe("callback", () => {
    it("Should emit on callback", async () => {
        const iter = callback(setTimeout, clearTimeout, 1);
        const end = Symbol('end');

        await expect(iter.next()).resolves.toEqual({
            value: [],
            done: false
        });

        const result = await Promise.race([
            iter.next(),
            delay(50).then(() => end)
        ]);

        expect(result).toBe(end);
    });

    it("Should emit on multiple callbacks", async () => {
        const iter = callback(setInterval, clearInterval, 1);

        await expect(iter.next()).resolves.toEqual({
            value: [],
            done: false
        });

        await expect(iter.next()).resolves.toEqual({
            value: [],
            done: false
        });

        await expect(iter.return()).resolves.toEqual({
            value: undefined,
            done: true
        })
    });

    it("Should queue callbacks in order", async () => {
        let state = 0;
        let last = 0;
        const mapper = () => state += 1;
        const iter = map(callback(setInterval, clearInterval, 1), mapper);

        for await(const el of iter) {
            expect(el).toEqual(last+1);
            last = el;
            await delay(10);
            if(el === 5) break;
        }

        await iter.return();
    });

    it("Should pass args to callback", async () => {
        const spy = jest.fn();
        const emitter =
            (_: (args: any[]) => void, a: string, b: number, c: Record<string, number>) =>
                spy([a, b, c]);
        const iter = callback(emitter, () => {}, "Hello", 10, {});
        await iter.return();

        expect(spy).toHaveBeenCalledWith(["Hello", 10, {}]);
    });

    it("Should fire cleanup function on return", async () => {
        const returnValue = Symbol('returnValue');
        const cleanup = jest.fn();
        const cb = jest.fn(() => returnValue);

        const iter = callback(cb, cleanup);

        await iter.return();

        expect(cleanup).toHaveBeenCalledWith(returnValue);
    });

    it("Should fire cleanup function on throw", async () => {
        const returnValue = Symbol('returnValue');
        const error = new Error("I'm an error");
        const cleanup = jest.fn();
        const emitter = () => returnValue;

        const iter = callback(emitter, cleanup);

        await expect(iter.throw(error)).rejects.toThrow(error);
        expect(cleanup).toHaveBeenCalledWith(returnValue)
    });
})