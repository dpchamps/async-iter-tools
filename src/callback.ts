import {PromiseQueue} from "./utils/promise-queue";
import {asyncIteratorFactory} from "./utils/asyncIteratorFactory";
import {noop} from "./utils/fns";

type Tuple<T> = readonly T[]
type Tail<T extends Tuple<any>> = T extends [any, ...infer U] ? U : never;
type Inner<T extends Tuple<any>> = (...args: T) => void;
type Outer<T extends Tuple<any>> = (x: Inner<T>, ...args: any[]) => any;
type Cleanup<T extends Outer<any>> = (result: ReturnType<T>) => void;

export const callback = <T extends Outer<any>>(emitter: T,  cleanup : Cleanup<T> = noop, ...args: Tail<Parameters<T>>) => {
    const queue = new PromiseQueue<Parameters<Parameters<typeof emitter>[0]>>();

    const result = emitter((...value) => {
        queue.enqueue(value);
    }, ...args);

    return asyncIteratorFactory({
        onNext: () => queue.dequeue(),
        cleanup: () => cleanup(result)
    });
}