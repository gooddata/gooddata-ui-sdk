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

import { _baseKeys } from "./_baseKeys.js";
import { _isArrayLike } from "./isArrayLike.js";

/**
 * The base implementation of `forEach` without support for iteratee shorthands: visits every element
 * of an array-like by index, holes included, or every own enumerable value of an object by key. The
 * iteratee may stop the iteration early by returning `false`.
 *
 * @param collection - The collection to iterate over.
 * @param iteratee - The function invoked per iteration with the value, its index or key, and the collection.
 * @internal
 */
export function _baseEach(
    collection: unknown,
    iteratee: (value: unknown, key: string | number, collection: object) => unknown,
): void {
    if (collection == null) {
        return;
    }

    const iterable = Object(collection) as Record<PropertyKey, unknown>;

    if (_isArrayLike(collection)) {
        const length = (collection as ArrayLike<unknown>).length;

        for (let index = 0; index < length; index++) {
            if (iteratee(iterable[index], index, iterable) === false) {
                return;
            }
        }

        return;
    }

    for (const key of _baseKeys(iterable)) {
        if (iteratee(iterable[key], key, iterable) === false) {
            return;
        }
    }
}
