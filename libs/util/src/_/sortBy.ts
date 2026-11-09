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

import { _baseOrderBy } from "./_baseOrderBy.js";
import { _isIterateeCall } from "./_isIterateeCall.js";
import type { _List, _ListIteratee, _Many, _ObjectIteratee } from "./types.js";

/**
 * Creates an array of elements, sorted in ascending order by the results of running each element in a
 * collection through each iteratee. This method performs a stable sort, that is, it preserves the original
 * sort order of equal elements. The iteratees are invoked with one argument: (value).
 *
 * @param collection - The collection to iterate over.
 * @param iteratees - The iteratees to sort by, specified individually or in arrays.
 * @returns Returns the new sorted array.
 * @internal
 */
export function _sortBy<T>(
    collection: _List<T> | null | undefined,
    ...iteratees: _Many<_ListIteratee<T>>[]
): T[];
/**
 * @internal
 */
export function _sortBy<T extends object>(
    collection: T | null | undefined,
    ...iteratees: _Many<_ObjectIteratee<T>>[]
): T[keyof T][];
export function _sortBy(collection: unknown, ...iteratees: unknown[]): unknown[] {
    if (collection == null) {
        return [];
    }

    // called as an iteratee, e.g. by `map`, the trailing index and collection are not iteratees
    if (iteratees.length > 1 && _isIterateeCall(collection, iteratees[0], iteratees[1])) {
        iteratees = [];
    } else if (iteratees.length > 2 && _isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
        iteratees = [iteratees[0]];
    }

    return _baseOrderBy(collection, iteratees.flat());
}
