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
import type { _Comparator, _Comparator2, _List } from "./types.js";

/**
 * This method is like `_intersection` except that it accepts `comparator` which is invoked to compare
 * elements of the arrays. The order and references of result values are determined by the first array. The
 * comparator is invoked with two arguments: (arrVal, othVal). As in lodash, only a function in the last
 * position is taken as the comparator, arguments that are not array-like objects count as empty, the result
 * is deduplicated through the comparator too, and `-0` is kept as it is when a comparator is used.
 *
 * @param array - The first array to inspect.
 * @param values - The other arrays to inspect.
 * @param comparator - The comparator invoked per element.
 * @returns Returns the new array of intersecting values.
 * @internal
 */
export function _intersectionWith<T1, T2>(
    array: _List<T1> | null | undefined,
    values: _List<T2>,
    comparator: _Comparator2<T1, T1 | T2>,
): T1[];
/**
 * @internal
 */
export function _intersectionWith<T1, T2, T3>(
    array: _List<T1> | null | undefined,
    values1: _List<T2>,
    values2: _List<T3>,
    comparator: _Comparator2<T1, T1 | T2 | T3>,
): T1[];
/**
 * @internal
 */
export function _intersectionWith<T1, T2, T3, T4>(
    array: _List<T1> | null | undefined,
    values1: _List<T2>,
    values2: _List<T3>,
    ...values: (_List<T4> | _Comparator2<T1, T1 | T2 | T3 | T4>)[]
): T1[];
/**
 * @internal
 */
export function _intersectionWith<T>(array?: _List<T> | null, ...values: (_List<T> | _Comparator<T>)[]): T[];
export function _intersectionWith(...values: unknown[]): unknown[] {
    const last = values[values.length - 1];
    const comparator = typeof last === "function" ? (last as _Comparator2<unknown, unknown>) : undefined;
    const arrays = comparator ? values.slice(0, -1) : values;

    return _baseIntersection(arrays, undefined, comparator);
}
