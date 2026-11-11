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
 * The base implementation of `_intersection`, `_intersectionBy` and `_intersectionWith`: creates an array of
 * the values of the first array whose criterion appears in every other array, compared with SameValueZero,
 * or with `comparator` when one is given. Each criterion is kept once, with the first value producing it, in
 * the order of the first array and with `-0` normalised to `0` unless a comparator is used. Only array-like
 * objects are inspected: any other first argument yields an empty array and any other argument counts as
 * empty. As in lodash, the criteria of the other arrays are computed from the last array to the first, the
 * other arrays are searched in that order too, and the first array is only walked until the result is as
 * long as the shortest array.
 *
 * @param arrays - The arrays to inspect.
 * @param iteratee - The iteratee invoked per element to produce its criterion. Defaults to identity.
 * @param comparator - The comparator invoked per criterion with (arrayValue, otherValue); a truthy result
 *  is a match, and the result is also deduplicated through it.
 * @returns Returns the new array of intersecting values.
 * @internal
 */
export function _baseIntersection<T>(
    arrays: unknown[],
    iteratee: (value: unknown) => unknown = (value) => value,
    comparator?: (arrayValue: unknown, otherValue: unknown) => boolean,
): T[] {
    const [first, ...others] = arrays;

    if (!_isObjectLike(first) || !_isArrayLike(first)) {
        return [];
    }

    const source = first as _List<T>;
    const otherCriteria: unknown[][] = [];
    let maxLength = source.length;

    for (let position = others.length - 1; position >= 0; position--) {
        const list = others[position];
        const isList = _isObjectLike(list) && _isArrayLike(list);
        const values = isList ? Array.from(list as ArrayLike<unknown>) : [];

        maxLength = Math.min(maxLength, values.length);
        otherCriteria.push(values.map((value) => iteratee(value)));
    }

    const otherSets = comparator ? [] : otherCriteria.map((criteria) => new Set(criteria));
    const seen = new Set<unknown>();
    const result: T[] = [];
    const resultCriteria: unknown[] = [];

    for (let index = 0; index < source.length && result.length < maxLength; index++) {
        const value = source[index] as T;
        const computed = iteratee(value);

        if (comparator) {
            const matches = (other: unknown) => comparator(computed, other);

            if (resultCriteria.some(matches) || otherCriteria.some((criteria) => !criteria.some(matches))) {
                continue;
            }

            resultCriteria.push(computed);
            // lodash keeps `-0` as it is when a comparator is used
            result.push(value);

            continue;
        }

        if (seen.has(computed) || otherSets.some((set) => !set.has(computed))) {
            continue;
        }

        seen.add(computed);
        // lodash normalises `-0` to `+0` in the result
        result.push((value as unknown) === 0 ? (0 as unknown as T) : value);
    }

    return result;
}
