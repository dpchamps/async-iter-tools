import {iteratorResult} from "./iterator-result";

interface FactoryArgs<T, U = undefined> {
    onNext: (...args: [] | [U]) => Promise<T>,
    cleanup: () => void,
}

interface TypedAsyncIterableIterator<T, TArgs = undefined> extends AsyncIterator<T, any, TArgs> {
    [Symbol.asyncIterator](): TypedAsyncIterableIterator<T, TArgs>;
}

export const asyncIteratorFactory = <T, U = any, V = undefined>(factoryArgs: FactoryArgs<T>): Required<TypedAsyncIterableIterator<T>> => {
    let done = false;
    const config = factoryArgs;

    const cleanup = () => {
        done = true;
        config.cleanup();
    }

    return {
        async next(...args) {
            if(done) return iteratorResult(undefined, true) as IteratorReturnResult<undefined>;

            return iteratorResult(await config.onNext(...args), false);
        },

        async throw(e?: unknown){
            cleanup();
            throw e;
        },

        async return(value?) {
            cleanup();
            return iteratorResult(value, true);
        },

        [Symbol.asyncIterator](){ return this; }
    }
}