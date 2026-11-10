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

import { _baseDifference } from "./_baseDifference.js";
import { _baseIteratee } from "./_baseIteratee.js";
import { _isArrayLike } from "./isArrayLike.js";
import { _isObjectLike } from "./isObjectLike.js";
import type { _List, _ValueIteratee } from "./types.js";

/**
 * This method is like `_difference` except that it accepts `iteratee` which is invoked for each element of
 * `array` and `values` to generate the criterion by which they're compared. The order and references of
 * result values are determined by the first array. The iteratee is invoked with one argument: (value).
 * The iteratee is the last argument unless that argument is array-like, in which case it is one more list of
 * values and the elements are compared as they are.
 *
 * @param array - The array to inspect.
 * @param values - The values to exclude, followed by the iteratee.
 * @returns Returns the new array of filtered values.
 * @internal
 */
export function _differenceBy<T1, T2>(
    array: _List<T1> | null | undefined,
    values: _List<T2>,
    iteratee: _ValueIteratee<T1 | T2>,
): T1[];
/**
 * @internal
 */
export function _differenceBy<T1, T2, T3>(
    array: _List<T1> | null | undefined,
    values1: _List<T2>,
    values2: _List<T3>,
    iteratee: _ValueIteratee<T1 | T2 | T3>,
): T1[];
/**
 * @internal
 */
export function _differenceBy<T1, T2, T3, T4>(
    array: _List<T1> | null | undefined,
    values1: _List<T2>,
    values2: _List<T3>,
    values3: _List<T4>,
    iteratee: _ValueIteratee<T1 | T2 | T3 | T4>,
): T1[];
/**
 * @internal
 */
export function _differenceBy<T1, T2, T3, T4, T5>(
    array: _List<T1> | null | undefined,
    values1: _List<T2>,
    values2: _List<T3>,
    values3: _List<T4>,
    values4: _List<T5>,
    iteratee: _ValueIteratee<T1 | T2 | T3 | T4 | T5>,
): T1[];
/**
 * @internal
 */
export function _differenceBy<T1, T2, T3, T4, T5, T6>(
    array: _List<T1> | null | undefined,
    values1: _List<T2>,
    values2: _List<T3>,
    values3: _List<T4>,
    values4: _List<T5>,
    values5: _List<T6>,
    iteratee: _ValueIteratee<T1 | T2 | T3 | T4 | T5 | T6>,
): T1[];
/**
 * @internal
 */
export function _differenceBy<T1, T2, T3, T4, T5, T6, T7>(
    array: _List<T1> | null | undefined,
    values1: _List<T2>,
    values2: _List<T3>,
    values3: _List<T4>,
    values4: _List<T5>,
    values5: _List<T6>,
    ...values: (_List<T7> | _ValueIteratee<T1 | T2 | T3 | T4 | T5 | T6 | T7>)[]
): T1[];
/**
 * @internal
 */
export function _differenceBy<T>(array: _List<T> | null | undefined, ...values: _List<T>[]): T[];
export function _differenceBy(array: unknown, ...values: unknown[]): unknown[] {
    const last = values[values.length - 1];
    const iteratee = _isObjectLike(last) && _isArrayLike(last) ? undefined : last;

    return _baseDifference(array as _List<unknown>, values, _baseIteratee(iteratee));
}
