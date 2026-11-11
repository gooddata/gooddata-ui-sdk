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

import { _baseIteratee } from "./_baseIteratee.js";
import { _baseUniq } from "./_baseUniq.js";
import { _flattenArrayLikeObjects } from "./_flattenArrayLikeObjects.js";
import { _isArrayLike } from "./isArrayLike.js";
import { _isObjectLike } from "./isObjectLike.js";
import type { _List, _ValueIteratee } from "./types.js";

/**
 * This method is like `_union` except that it accepts `iteratee` which is invoked for each element of each
 * array to generate the criterion by which uniqueness is computed. Result values are chosen from the first
 * array in which the value occurs. The iteratee is invoked with one argument: (value). As in lodash, the
 * last argument is taken as the iteratee unless it is an array-like object, so an array is always a list
 * to merge, and arguments that are not array-like objects are skipped.
 *
 * @param arrays - The arrays to inspect, followed by the optional iteratee.
 * @returns Returns the new array of combined values.
 * @internal
 */
export function _unionBy<T>(arrays: _List<T> | null | undefined, iteratee?: _ValueIteratee<T>): T[];
/**
 * @internal
 */
export function _unionBy<T>(
    arrays1: _List<T> | null | undefined,
    arrays2: _List<T> | null | undefined,
    iteratee?: _ValueIteratee<T>,
): T[];
/**
 * @internal
 */
export function _unionBy<T>(
    arrays1: _List<T> | null | undefined,
    arrays2: _List<T> | null | undefined,
    arrays3: _List<T> | null | undefined,
    iteratee?: _ValueIteratee<T>,
): T[];
/**
 * @internal
 */
export function _unionBy<T>(
    arrays1: _List<T> | null | undefined,
    arrays2: _List<T> | null | undefined,
    arrays3: _List<T> | null | undefined,
    arrays4: _List<T> | null | undefined,
    iteratee?: _ValueIteratee<T>,
): T[];
/**
 * @internal
 */
export function _unionBy<T>(
    arrays1: _List<T> | null | undefined,
    arrays2: _List<T> | null | undefined,
    arrays3: _List<T> | null | undefined,
    arrays4: _List<T> | null | undefined,
    arrays5: _List<T> | null | undefined,
    ...iteratee: (_ValueIteratee<T> | _List<T> | null | undefined)[]
): T[];
/**
 * @internal
 */
export function _unionBy<T>(...values: (_ValueIteratee<T> | _List<T> | null | undefined)[]): T[];
export function _unionBy(...values: unknown[]): unknown[] {
    const last = values[values.length - 1];
    const iteratee = _isObjectLike(last) && _isArrayLike(last) ? undefined : last;

    // a non-list iteratee is not array-like, so the flatten drops it from the values
    return _baseUniq(_flattenArrayLikeObjects(values), _baseIteratee(iteratee));
}
