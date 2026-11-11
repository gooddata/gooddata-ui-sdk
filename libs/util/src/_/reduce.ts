// (C) 2026 GoodData Corporation

/*!
 * Portions of this file are derived from Lodash.
 * https://github.com/lodash/lodash
 *
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 *
 * Based on Underscore.js, copyright Jeremy Ashkenas,
 * DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>
 *
 * Modifications Copyright (c) 2026 GoodData Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { _baseEach } from "./_baseEach.js";
import { _baseIteratee } from "./_baseIteratee.js";
import type { _List, _MemoListIterator, _MemoObjectIterator } from "./types.js";

/**
 * Reduces `collection` to a value which is the accumulated result of running each element in `collection`
 * thru `iteratee`, where each successive invocation is supplied the return value of the previous. If
 * `accumulator` is not given, the first element of `collection` is used as the initial value; whether it
 * was given is decided by the argument count, as in lodash. The iteratee is invoked with four arguments:
 * (accumulator, value, index|key, collection). Arrays and array-likes are iterated by index, strings by
 * character, other objects by their own enumerable string keys.
 *
 * @param collection - The collection to iterate over.
 * @param iteratee - The function invoked per iteration, or an iteratee shorthand.
 * @param accumulator - The initial value.
 * @returns Returns the accumulated value.
 * @internal
 */
export function _reduce<T, TResult>(
    collection: T[] | null | undefined,
    iteratee: _MemoListIterator<T, TResult, T[]>,
    accumulator: TResult,
): TResult;
/**
 * @internal
 */
export function _reduce<T, TResult>(
    collection: _List<T> | null | undefined,
    iteratee: _MemoListIterator<T, TResult, _List<T>>,
    accumulator: TResult,
): TResult;
/**
 * @internal
 */
export function _reduce<T extends object, TResult>(
    collection: T | null | undefined,
    iteratee: _MemoObjectIterator<T[keyof T], TResult, T>,
    accumulator: TResult,
): TResult;
/**
 * @internal
 */
export function _reduce<T>(
    collection: T[] | null | undefined,
    iteratee: _MemoListIterator<T, T, T[]>,
): T | undefined;
/**
 * @internal
 */
export function _reduce<T>(
    collection: _List<T> | null | undefined,
    iteratee: _MemoListIterator<T, T, _List<T>>,
): T | undefined;
/**
 * @internal
 */
export function _reduce<T extends object>(
    collection: T | null | undefined,
    iteratee: _MemoObjectIterator<T[keyof T], T[keyof T], T>,
): T[keyof T] | undefined;
export function _reduce(collection: unknown, iteratee?: unknown, ...accumulator: unknown[]): unknown {
    const callback = _baseIteratee(iteratee) as (
        accumulator: unknown,
        value: unknown,
        key: unknown,
        collection: unknown,
    ) => unknown;
    let initial = accumulator.length === 0;
    let result = accumulator[0];

    _baseEach(collection, (value, key, iterable) => {
        if (initial) {
            initial = false;
            result = value;
        } else {
            result = callback(result, value, key, iterable);
        }
    });

    return result;
}
