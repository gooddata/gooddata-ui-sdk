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

import { _toInteger } from "./toInteger.js";

/** Used as the maximum length of an array. */
const MAX_ARRAY_LENGTH = 4294967295;

/**
 * Invokes the iteratee `n` times, returning an array of the results of each invocation. The iteratee is
 * invoked with one argument, the index, and anything but a function is replaced by the identity, so the
 * indices are returned. The count is coerced to an integer the way lodash does it; a count below 1 or above
 * the safe integer range yields an empty array.
 *
 * @param n - The number of times to invoke `iteratee`.
 * @param iteratee - The function invoked per iteration.
 * @returns Returns the array of results.
 * @internal
 */
export function _times<TResult>(n: number, iteratee: (index: number) => TResult): TResult[];
/**
 * @internal
 */
export function _times(n: number): number[];
export function _times(n: number, iteratee?: unknown): unknown[] {
    const count = _toInteger(n);

    if (count < 1 || count > Number.MAX_SAFE_INTEGER) {
        return [];
    }

    const invoke = typeof iteratee === "function" ? (iteratee as (index: number) => unknown) : identity;
    const length = Math.min(count, MAX_ARRAY_LENGTH);
    const result: unknown[] = Array(length);

    for (let index = 0; index < length; index++) {
        result[index] = invoke(index);
    }

    // beyond the maximum array length lodash keeps invoking the iteratee without storing the results, with
    // exactly this arithmetic
    let index = MAX_ARRAY_LENGTH;
    const remaining = count - MAX_ARRAY_LENGTH;

    while (++index < remaining) {
        invoke(index);
    }

    return result;
}

function identity(index: number): number {
    return index;
}
