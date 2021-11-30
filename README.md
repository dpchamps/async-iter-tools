# Async Iterator Tools

A lightweight lib that provides well-typed async iterator utilities.

## Example
(run working example: ` npx ts-node ./examples/childProcess/childProcess.ts` )
```typescript
const child = fork(`${__dirname}/child.js`);
   
const iter = merge(
    map(on(child, "message"), ([message]: string[]) => ({type: "message", value: message})),
    map(on(child, "exit"), ([statusCode]: number[]) => ({type: "exit", value: message})),
    throws(map(on(child, "error"), ([error]: unknown) => ({type: 'error', value: error}))),
);

try{
    for await (const event of iter){
        console.log(event);
    }
}catch (e){
    console.log(`Halted with error:`, e);
}
```

## Docs

### Core

#### collect

Collect an iterator into an array

```typescript
import {collect} from "./collect";

await collect(myAsyncGenerator())
```

#### repeat

Emit a value indefinitely

```typescript
import {repeat} from "./repeat";

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
for await (const value of repeat(() => sleep(100).then(() => "Hi ma"))){
    // value is "Hi ma" indefinitely
}
```

#### take

Takes up to the number specified. If the underlying iterator is consumed (via `return` or `throw`)
take will finish.

```typescript
import {take} from "./take";

for await(const value of take(range(0, 200), 2)){
    // value: 0, 1
}
```

### Transforms

#### filter

Filter an iterator based on a predicate.

Returns when underlying iterator is exhausted. Does not filter `IteratorReturnResult`. **note: has the potential to 
hang if the underlying iterator is infinite and the predicate is never satisfied**

```typescript
import {filter} from "./filter";

const base = async function* () {
    let x = 0;
    while (x < 10) {
        yield x++;
    }
};

for await (const value of filter(base(), (x) => x % 2 === 0) ){
    // value: 0, 2, 4, 6, 8
}
```

#### map

Map an iterator.

```typescript
async function* base() {
  await delay(1);
  yield 2;
}

for await (const value of map(base(), (x) => x ** 2)) {
  // value: 4 
}
```

### Functions

#### callback

Transport a callback function into an iterator.

params:

1. `callback`, a callback function
2. `cleanup`, a function that is called when the iterator returns or throws. It is passed a value
that is returned from `callback`
3. `...args` (optional),  args to be passed to `callback

```typescript
import {callback} from "./callback";

const intervalIterator = callback(setInterval, clearInterval, 100);
// Creates an iterator that yields every 100 ms

for await(const _ of intervalIterator){
    // This "ticks" every 100 ms
}
```

#### merge

Merges n-iterators into a single iterator. Take results as they are yielded, only
ever consumes at most the next iterator value for each iterator supplied. 
Precedence for iterators that yield at the same time is the same as what `Promise.race` guarantees.

```typescript
import {merge} from "./merge";

async function* fastFn() {
    yield "A";
    await delay(5);
    yield "B";
    await delay(50);
    yield "C";
}

async function* slowFn() {
    yield 1;
    await delay(20);
    yield 2;
    await delay(1);
    yield 3;
}

const merged = collect(merge(fastFn(), slowFn()));
// ["A", 1, "B", 2, 3, "C"]
```

#### on

Transport an event emitter into an iterator.

```typescript
import {on} from "./on";

const childProcess = spawnSomeChildProcess();

const onMessage = on(childProcess, 'message');

for await(const message of onMessage) {
    // message from childprocess
}
```

Will remove event listener from event emitter when `return` or `throw` is called on the iterator.

#### throws

Throws when given iterator yields. Will call `throw` on supplied iterator if exists. Otherwise, it will throw value.

Params:

1. iterator - Base iterator
2. transformer (optional) - Transform value of error to throw

```typescript
import {throws} from "./throws";

const childProcess = spawnSomeChildProcess();
const onError = throws(on(childProcess, 'error'), (e) => `Child Process emitter error ${e.message}`);

onError.next().catch(console.error);
```