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
import { _baseSlice } from "./_baseSlice.js";
import type { _List, _ListIteratee } from "./types.js";

/**
 * Creates a slice of `array` excluding elements dropped from the end. Elements are dropped until
 * `predicate` returns falsey. The predicate is invoked with three arguments: (value, index, array), and may
 * be an iteratee shorthand; it defaults to the identity. The result is a new dense array.
 *
 * @param array - The array to query.
 * @param predicate - The function invoked per iteration.
 * @returns Returns the slice of `array`.
 * @internal
 */
export function _dropRightWhile<T>(array: _List<T> | null | undefined, predicate?: _ListIteratee<T>): T[] {
    if (!array?.length) {
        return [];
    }

    const test = _baseIteratee(predicate) as (value: T, index: number, array: _List<T>) => unknown;
    let index = array.length - 1;

    while (index >= 0 && test(array[index] as T, index, array)) {
        index--;
    }

    return _baseSlice(array, 0, index + 1);
}
