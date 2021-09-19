import {pushToPull} from "./pushToPull";
import {EventEmitter} from "events";

describe("pushToPull Async Iterator", () => {
    type EventEmitterIterator = {
        event: 'exit',
        statusCode: number
    } | {
        event: 'message',
        value: string
    }

    const getEventEmitterIterator = (ee: EventEmitter) => pushToPull<EventEmitterIterator>((iterator) => {
        ee.on("exit", (statusCode: number) => {
            if(statusCode !== 0) return iterator.throw(`Received a non-zero statusCode`);
            iterator.return({event: 'exit', statusCode})
        });

        ee.on('message', (message: string) => {
            iterator.next({event: "message", value: message})
        })
    });

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    it("Redirect pull-based control flow to push based", async () => {
        expect.assertions(1);

        const ee = new EventEmitter();

        setTimeout(() => {
            ee.emit('exit', 0);
        }, 500);

        const asyncIter = getEventEmitterIterator(ee);

        for await (const event of asyncIter){
            expect(event).toEqual({event: 'exit', statusCode: 0})
        }
    });

    it("Should handle some non-obvious racy things", async () => {
        const asyncIter = pushToPull((iterator) => {
            setImmediate(() => iterator.next("one"));
            setImmediate(() => iterator.return("two"));
        });

        await expect(asyncIter.next()).resolves.toEqual({done: false, value: "one"});
        await expect(asyncIter.next()).resolves.toEqual({done: false, value: "two"});
        await expect(asyncIter.next()).resolves.toEqual({done: true, value: undefined});
    });

    it("Should handle late push gracefully", async () => {
        const timeoutSpy = jest.fn();
        const asyncIter = pushToPull((iterator) => {
            setTimeout(() => {
                timeoutSpy();
                iterator.next("two")
            },2);
            setImmediate(() => iterator.return("one"));
        });

        await expect(asyncIter.next()).resolves.toEqual({done: false, value: "one"});
        await expect(asyncIter.next()).resolves.toEqual({done: true, value: undefined});
        await delay(2);
        expect(timeoutSpy).toHaveBeenCalled();
        await expect(asyncIter.next()).resolves.toEqual({done: true, value: undefined});
    });

    it("Should handle a throw", async () => {
        const expectedError = new Error(":D");
        const asyncIter = pushToPull((iterator) => {
            setTimeout(() => {
                iterator.throw(expectedError)
            });
        });

        await expect(asyncIter.next()).rejects.toThrowError(expectedError);
    });

    it("Should halt iteration when a throw occurs", async () => {
        const expectedError = new Error(":D");
        const asyncIter = pushToPull<void>((iterator) => {
           delay(1)
               .then(() => iterator.next())
               .then(() => delay(1))
               .then(() => iterator.throw(expectedError))
               .then(() => delay(1))
               .then(() => iterator.next())
        });

        await expect(asyncIter.next()).resolves.toEqual({done: false, value: undefined});
        await expect(asyncIter.next()).rejects.toThrowError(expectedError);
        await expect(asyncIter.next()).resolves.toEqual({done: true, value: undefined});

    })
});
