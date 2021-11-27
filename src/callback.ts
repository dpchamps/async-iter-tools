import {PromiseQueue} from "./utils/promise-queue";
import {asyncIteratorFactory} from "./utils/AsyncIteratorFactory";
import {noop} from "./utils";

type Tuple<T> = readonly T[]
type Tail<T extends Tuple<unknown>> = T extends [any, ...infer U] ? U : never;
type Inner<T extends Tuple<any>> = (...args: T) => void;
type Outer<T extends Tuple<any>> = (x: Inner<T>, ...args: any[]) => any;
type Cleanup<T extends Outer<any>> = (result: ReturnType<T>) => void;

export const callback = <T extends Outer<any>>(emitter: T,  cleanup : Cleanup<T> = noop, ...args: Tail<Parameters<T>>) => {
    const queue = new PromiseQueue();

    const result = emitter((...value) => {
        queue.enqueue(value);
    }, ...args);

    return asyncIteratorFactory({
        onNext: () => queue.dequeue(),
        cleanup: () => cleanup(result)
    });
}