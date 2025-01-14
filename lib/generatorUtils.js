/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
export function* empty() {
}
export function split(iterable) {
    const iterator = iterable[Symbol.iterator]();
    const { done, value } = iterator.next();
    if (done) {
        return { rest: empty() };
    }
    else {
        return { value, rest: iterator };
    }
}
export function first(iterable) {
    const iterator = iterable[Symbol.iterator]();
    const { done, value } = iterator.next();
    if (!done) {
        return value;
    }
    return undefined;
}
