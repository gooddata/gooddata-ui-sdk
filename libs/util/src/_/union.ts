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

import { _baseUniq } from "./_baseUniq.js";
import { _isArrayLike } from "./isArrayLike.js";
import { _isObjectLike } from "./isObjectLike.js";
import type { _List } from "./types.js";

/**
 * Creates an array of unique values, in order, from all given arrays using SameValueZero for equality
 * comparisons. Only array-like objects are inspected; other arguments, strings included, are skipped.
 *
 * @param arrays - The arrays to inspect.
 * @returns Returns the new array of combined values.
 * @internal
 */
export function _union<T>(...arrays: (_List<T> | null | undefined)[]): T[] {
    const values: T[] = [];

    for (const array of arrays) {
        if (!_isObjectLike(array) || !_isArrayLike(array)) {
            continue;
        }

        // visited by index, so holes become `undefined` entries
        for (let index = 0; index < array.length; index++) {
            values.push(array[index] as T);
        }
    }

    return _baseUniq(values);
}
