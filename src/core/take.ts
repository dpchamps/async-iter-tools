import {intoAsyncIterableIterator} from "../utils/intoAsyncIterableIterator";
import {InferAsyncIterator, RequiredAsyncIterableIterator} from "../utils/types";
import {iteratorResult} from "../utils/iterator-result";

export const take = <T extends AsyncIterator<any>>(it:T, n: number): RequiredAsyncIterableIterator<InferAsyncIterator<T>> => ({
 ...intoAsyncIterableIterator(it),
 async next(...args){
     if(--n < 0) return iteratorResult(undefined, true);

     return it.next(...args);
 }
})