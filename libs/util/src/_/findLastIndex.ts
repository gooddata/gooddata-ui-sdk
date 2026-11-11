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

import { _baseIteratee } from "./_baseIteratee.js";
import { _toInteger } from "./toInteger.js";
import type { _List, _ListIterateeCustom } from "./types.js";

/**
 * This method is like `_findIndex` except that it iterates over elements of `array` from right to left,
 * returning the index of the first element `predicate` returns truthy for, else `-1`. The predicate is
 * invoked with three arguments: (value, index, array), may be an iteratee shorthand and defaults to the
 * identity. The search starts at `fromIndex`, which is coerced to an integer the way lodash does it, counted
 * from the end when negative and clamped into the array.
 *
 * @param array - The array to inspect.
 * @param predicate - The function invoked per iteration.
 * @param fromIndex - The index to search from. Defaults to the last index.
 * @returns Returns the index of the found element, else `-1`.
 * @internal
 */
export function _findLastIndex<T>(
    array: _List<T> | null | undefined,
    predicate?: _ListIterateeCustom<T, boolean>,
    fromIndex?: number,
): number {
    if (!array?.length) {
        return -1;
    }

    const length = array.length;
    let start = length - 1;

    if (fromIndex !== undefined) {
        const from = _toInteger(fromIndex);

        // as in lodash, the sign is read from the raw argument
        start = fromIndex < 0 ? Math.max(length + from, 0) : Math.min(from, length - 1);
    }

    const test = _baseIteratee(predicate) as (value: T, index: number, array: _List<T>) => unknown;
    // counting down from one past the start keeps a `-0` start from being returned as is, as in lodash
    let index = start + 1;

    while (index--) {
        if (test(array[index] as T, index, array)) {
            return index;
        }
    }

    return -1;
}
