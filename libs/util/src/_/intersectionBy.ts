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

import { _baseIntersection } from "./_baseIntersection.js";
import { _baseIteratee } from "./_baseIteratee.js";
import { _isArrayLike } from "./isArrayLike.js";
import { _isObjectLike } from "./isObjectLike.js";
import type { _List, _ValueIteratee } from "./types.js";

/**
 * This method is like `_intersection` except that it accepts `iteratee` which is invoked for each element
 * of each array to generate the criterion by which they're compared. The order and references of result
 * values are determined by the first array. The iteratee is invoked with one argument: (value). As in
 * lodash, the last argument is taken as the iteratee unless it is an array-like object, so an array is
 * always a list to intersect.
 *
 * @param array - The first array to inspect.
 * @param values - The other arrays to inspect.
 * @param iteratee - The iteratee invoked per element.
 * @returns Returns the new array of intersecting values.
 * @internal
 */
export function _intersectionBy<T1, T2>(
    array: _List<T1> | null,
    values: _List<T2>,
    iteratee: _ValueIteratee<T1 | T2>,
): T1[];
/**
 * @internal
 */
export function _intersectionBy<T1, T2, T3>(
    array: _List<T1> | null,
    values1: _List<T2>,
    values2: _List<T3>,
    iteratee: _ValueIteratee<T1 | T2 | T3>,
): T1[];
/**
 * @internal
 */
export function _intersectionBy<T1, T2, T3, T4>(
    array: _List<T1> | null | undefined,
    values1: _List<T2>,
    values2: _List<T3>,
    ...values: (_List<T4> | _ValueIteratee<T1 | T2 | T3 | T4>)[]
): T1[];
/**
 * @internal
 */
export function _intersectionBy<T>(array?: _List<T> | null, ...values: _List<T>[]): T[];
/**
 * @internal
 */
export function _intersectionBy<T>(...values: (_List<T> | _ValueIteratee<T>)[]): T[];
export function _intersectionBy(...values: unknown[]): unknown[] {
    const last = values[values.length - 1];
    const lastIsList = _isObjectLike(last) && _isArrayLike(last);
    const arrays = lastIsList || values.length === 0 ? values : values.slice(0, -1);

    return _baseIntersection(arrays, _baseIteratee(lastIsList ? undefined : last));
}
