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

import type { _List } from "./types.js";

/**
 * The base implementation of `_.slice` without an iteratee call guard: copies the elements of `array` from
 * `start` up to, but not including, `end` into a new dense array. Negative positions count from the end,
 * positions are clamped to the length, and holes become `undefined`. The `length` of `array` is used as is,
 * as in lodash.
 *
 * @param array - The array to slice.
 * @param start - The start position.
 * @param end - The end position.
 * @returns Returns the slice of `array`.
 * @internal
 */
export function _baseSlice<T>(array: _List<T>, start: number, end: number): T[] {
    const length = array.length;

    if (start < 0) {
        start = -start > length ? 0 : length + start;
    }

    end = end > length ? length : end;

    if (end < 0) {
        end += length;
    }

    const count = start > end ? 0 : (end - start) >>> 0;
    const from = start >>> 0;
    const result: T[] = Array(count);

    for (let index = 0; index < count; index++) {
        result[index] = array[index + from] as T;
    }

    return result;
}
