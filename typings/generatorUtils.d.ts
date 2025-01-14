/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { Maybe } from './Maybe';
export declare function empty<T>(): IterableIterator<T>;
export declare function split<T>(iterable: IterableIterator<T>): {
    value?: T;
    rest: IterableIterator<T>;
};
export declare function first<T>(iterable: IterableIterator<T>): Maybe<T>;
