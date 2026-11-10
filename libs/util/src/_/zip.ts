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
 * Creates an array of grouped elements, the first of which contains the first elements of the given arrays,
 * the second of which contains the second elements of the given arrays, and so on. Shorter arrays are padded
 * with `undefined` up to the longest one. Only array-like objects take part; other arguments are skipped.
 *
 * @param arrays - The arrays to process.
 * @returns Returns the new array of grouped elements.
 * @internal
 */
export function _zip<T1, T2>(arrays1: _List<T1>, arrays2: _List<T2>): [T1 | undefined, T2 | undefined][];
/**
 * @internal
 */
export function _zip<T1, T2, T3>(
    arrays1: _List<T1>,
    arrays2: _List<T2>,
    arrays3: _List<T3>,
): [T1 | undefined, T2 | undefined, T3 | undefined][];
/**
 * @internal
 */
export function _zip<T1, T2, T3, T4>(
    arrays1: _List<T1>,
    arrays2: _List<T2>,
    arrays3: _List<T3>,
    arrays4: _List<T4>,
): [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined][];
/**
 * @internal
 */
export function _zip<T1, T2, T3, T4, T5>(
    arrays1: _List<T1>,
    arrays2: _List<T2>,
    arrays3: _List<T3>,
    arrays4: _List<T4>,
    arrays5: _List<T5>,
): [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined, T5 | undefined][];
/**
 * @internal
 */
export function _zip<T>(...arrays: (_List<T> | null | undefined)[]): (T | undefined)[][];
export function _zip(...arrays: unknown[]): unknown[][] {
    const groups = arrays.filter(
        (array): array is ArrayLike<unknown> => _isObjectLike(array) && _isArrayLike(array),
    );
    const length = groups.reduce((longest, group) => Math.max(longest, group.length), 0);

    return Array.from({ length }, (_, index) => groups.map((group) => group[index]));
}
