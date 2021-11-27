import {InferAsyncIterator, RequiredAsyncIterableIterator} from "../utility-types";
import {iteratorResult} from "./iterator-result";

export const intoAsyncIterableIterator = <T extends AsyncIterator<any>>(it: T): RequiredAsyncIterableIterator<InferAsyncIterator<T>> => ({
    [Symbol.asyncIterator](){ return this },

    next(...args) {
        return it.next(...args)
    },

    return(value){
        if(typeof it.return !== 'undefined') return it.return(value);
        return Promise.resolve(iteratorResult(value, true));
    },

    throw(e){
        if(typeof it.throw !== 'undefined') return it.throw(e);
        throw e;
    }
})