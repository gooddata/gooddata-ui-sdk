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

import { _baseEach } from "./_baseEach.js";
import { _baseGet } from "./_baseGet.js";
import { _baseIteratee } from "./_baseIteratee.js";
import { _compareAscending } from "./_compareAscending.js";

type _Getter = (value: unknown) => unknown;

/** An element of the collection together with the values it is sorted by. */
type _Entry = { criteria: unknown[]; value: unknown };

/**
 * The base implementation of `_sortBy` without param guards: sorts the values of `collection` in ascending
 * order by the results of each iteratee, comparing the results of the first iteratee first.
 *
 * @param collection - The collection to iterate over.
 * @param iteratees - The iteratees to sort by; an array iteratee is a property path.
 * @returns Returns the new sorted array.
 * @internal
 */
export function _baseOrderBy(collection: unknown, iteratees: unknown[]): unknown[] {
    const getters: _Getter[] = iteratees.length ? iteratees.map(_toGetter) : [(value) => value];
    const entries: _Entry[] = [];

    _baseEach(collection, (value) => {
        entries.push({ criteria: getters.map((getter) => getter(value)), value });
    });

    // `Array#sort` is stable, so elements with equal criteria keep their input order
    entries.sort(_compareEntries);

    return entries.map((entry) => entry.value);
}

/** An array iteratee is a property path; a one-element path is read as its single key. */
function _toGetter(iteratee: unknown): _Getter {
    if (Array.isArray(iteratee)) {
        return (value) => _baseGet(value, iteratee.length === 1 ? iteratee[0] : iteratee);
    }

    return _baseIteratee(iteratee);
}

function _compareEntries(entry: _Entry, other: _Entry): number {
    for (let index = 0; index < entry.criteria.length; index++) {
        const result = _compareAscending(entry.criteria[index], other.criteria[index]);

        if (result) {
            return result;
        }
    }

    return 0;
}
