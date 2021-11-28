import {InferAsyncIterator, RequiredAsyncIterableIterator} from "../utils/types";
import {intoAsyncIterableIterator} from "../utils/intoAsyncIterableIterator";
import {iteratorResult} from "../utils/iterator-result";

export function filter<T extends AsyncIterator<any>, U extends InferAsyncIterator<T>>(
    it: T,
    predicate: (value: InferAsyncIterator<T>) => value is U
): RequiredAsyncIterableIterator<U>

export function filter<T extends AsyncIterator<any>, U extends InferAsyncIterator<T>>(
    it: T,
    predicate: (value: InferAsyncIterator<T>) => boolean
): RequiredAsyncIterableIterator<U>

export function filter<T extends AsyncIterator<any>, U extends InferAsyncIterator<T>>(
    it: T,
    predicate: (value: InferAsyncIterator<T>) => boolean
): RequiredAsyncIterableIterator<U>{
    return {
        ...intoAsyncIterableIterator(it),
        next: async (...args: Parameters<typeof it["next"]>) => {
            while(true){
                const next = await it.next(...args);
                if(next.done) return iteratorResult(next.value, true);
                if(predicate(next.value)) return iteratorResult(next.value, false);
            }
        }
    }
}