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

import { _isArrayLike } from "./isArrayLike.js";
import { _isObjectLike } from "./isObjectLike.js";

/**
 * Concatenates the elements of the array-like objects among `values` into a new array, in order, skipping
 * every other value. Elements are visited by index, so holes become `undefined` entries. This is the
 * one-level strict flatten that `_union` and `_unionBy` apply to their arguments.
 *
 * @param values - The values to flatten.
 * @returns Returns the new flattened array.
 * @internal
 */
export function _flattenArrayLikeObjects<T>(values: unknown[]): T[] {
    const result: T[] = [];

    for (const value of values) {
        if (!_isObjectLike(value) || !_isArrayLike(value)) {
            continue;
        }

        const list = value as ArrayLike<T>;

        for (let index = 0; index < list.length; index++) {
            result.push(list[index] as T);
        }
    }

    return result;
}
