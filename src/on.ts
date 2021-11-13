import EventEmitter from "events";
import {PromiseQueue} from "./utils/promise-queue";
import {iteratorResult} from "./utils/iterator-result";

export const on = (ee: EventEmitter, event: string): Required<AsyncIterableIterator<any>> => {
    const queue = new PromiseQueue();
    const eventHandler = (...args: any[]) => {
        queue.enqueue(args);
    };
    let done = false;
    const cleanup = () => {
        done = true;
        ee.off(event, eventHandler);
        debugger;
    }

    ee.on(event, eventHandler);

    return {
        async next() {
            if(done) return iteratorResult(undefined, true);
            const value = await queue.dequeue();
            return iteratorResult(value, false);
        },
        async throw(e) {
            cleanup();
            throw e
        },
        async return(value) {
            cleanup();
            return iteratorResult(value, true);
        },
        [Symbol.asyncIterator]() {
            return this
        }
    }
}