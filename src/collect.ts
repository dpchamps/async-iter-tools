export const collect = async <T>(iter: AsyncIterableIterator<T>) => {
    let event = [];

    for await (const x of iter){
        event.push(x)
    }

    return event;
}