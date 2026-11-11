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

import { _baseSlice } from "./_baseSlice.js";
import { _isIterateeCall } from "./_isIterateeCall.js";
import { _toInteger } from "./toInteger.js";
import type { _List } from "./types.js";

/**
 * Creates an array of elements split into groups the length of `size`. If `array` can't be split evenly, the
 * final chunk will be the remaining elements. The size is coerced to an integer the way lodash does it, and
 * a size below 1 yields an empty array.
 *
 * @param array - The array to process.
 * @param size - The length of each chunk. Defaults to 1.
 * @param guard - Enables use as an iteratee for methods like `map`: when it is the collection holding
 * `array` at index `size`, the size is ignored.
 * @returns Returns the new array of chunks.
 * @internal
 */
export function _chunk<T>(array: _List<T> | null | undefined, size?: number, guard?: unknown): T[][] {
    const chunkSize = (guard ? _isIterateeCall(array, size, guard) : size === undefined)
        ? 1
        : Math.max(_toInteger(size), 0);

    if (!array?.length || chunkSize < 1) {
        return [];
    }

    const length = array.length;
    const result: T[][] = Array(Math.ceil(length / chunkSize));
    let resIndex = 0;

    for (let index = 0; index < length; index += chunkSize) {
        result[resIndex++] = _baseSlice(array, index, index + chunkSize);
    }

    return result;
}
