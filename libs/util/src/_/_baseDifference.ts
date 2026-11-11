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
import type { _List } from "./types.js";

/**
 * The base implementation of `_difference`, `_differenceBy` and `_differenceWith`: creates an array of the
 * `array` values whose criteria are not among the criteria of the `values` lists, compared with
 * SameValueZero, or with `comparator` when one is given. The order and references of result values are
 * determined by the first array, with `-0` normalised to `0` unless a comparator is used. Only array-like
 * objects are inspected: any other `array` yields an empty array and any other entry of `values` is skipped.
 *
 * @param array - The array to inspect.
 * @param values - The lists of values to exclude.
 * @param iteratee - The iteratee invoked per element to produce its criterion. Defaults to identity.
 * @param comparator - The comparator invoked per element with (arrayValue, otherValue); a truthy result
 *  excludes the element.
 * @returns Returns the new array of filtered values.
 * @internal
 */
export function _baseDifference<T>(
    array: _List<T> | null | undefined,
    values: unknown[],
    iteratee: (value: unknown) => unknown = (value) => value,
    comparator?: (arrayValue: unknown, otherValue: unknown) => boolean,
): T[] {
    if (!_isObjectLike(array) || !_isArrayLike(array)) {
        return [];
    }

    const excluded: unknown[] = [];

    for (const list of values) {
        if (!_isObjectLike(list) || !_isArrayLike(list)) {
            continue;
        }

        for (let index = 0; index < list.length; index++) {
            excluded.push(iteratee((list as ArrayLike<unknown>)[index]));
        }
    }

    const excludedSet = new Set(excluded);
    const result: T[] = [];

    for (let index = 0; index < array.length; index++) {
        const value = array[index] as T;
        const computed = iteratee(value);

        if (comparator) {
            // lodash keeps `-0` as it is when a comparator is used
            if (!excluded.some((other) => comparator(computed, other))) {
                result.push(value);
            }
        } else if (!excludedSet.has(computed)) {
            // lodash normalises `-0` to `+0` in the result
            result.push((value as unknown) === 0 ? (0 as unknown as T) : value);
        }
    }

    return result;
}
