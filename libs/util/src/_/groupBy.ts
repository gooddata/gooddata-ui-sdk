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

import { _assignValue } from "./_assignValue.js";
import { _baseEach } from "./_baseEach.js";
import { _baseIteratee } from "./_baseIteratee.js";
import type { _Dictionary, _List, _ValueIteratee } from "./types.js";

/**
 * Creates an object composed of keys generated from the results of running each element of
 * `collection` thru `iteratee`. The order of grouped values is determined by the order they occur in
 * `collection`. The corresponding value of each key is an array of elements responsible for generating
 * the key. The iteratee is invoked with one argument: (value).
 *
 * @param collection - The collection to iterate over.
 * @param iteratee - The iteratee to transform keys.
 * @returns Returns the composed aggregate object.
 * @internal
 */
export function _groupBy<T>(
    collection: _List<T> | null | undefined,
    iteratee?: _ValueIteratee<T>,
): _Dictionary<T[]>;
/**
 * @see _groupBy
 * @internal
 */
export function _groupBy<T extends object>(
    collection: T | null | undefined,
    iteratee?: _ValueIteratee<T[keyof T]>,
): _Dictionary<Array<T[keyof T]>>;
export function _groupBy(collection: unknown, iteratee?: unknown): _Dictionary<unknown[]> {
    const result: Record<PropertyKey, unknown[]> = {};
    const toKey = _baseIteratee(iteratee);

    _baseEach(collection, (value) => {
        const key = toKey(value) as PropertyKey;

        if (Object.hasOwn(result, key)) {
            result[key]!.push(value);
        } else {
            // defines a `__proto__` key as an own property instead of changing the prototype
            _assignValue(result, key, [value]);
        }
    });

    return result;
}
