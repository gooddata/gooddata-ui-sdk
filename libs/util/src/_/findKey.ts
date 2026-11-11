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
import { _keys } from "./keys.js";
import type { _ObjectIteratee } from "./types.js";

type _AnyRecord = Record<PropertyKey, unknown>;

/**
 * This method is like `_find` except that it returns the key of the first element `predicate` returns
 * truthy for instead of the element itself. Own enumerable string keys are inspected in order, array-likes
 * and strings by index; the predicate is invoked with three arguments: (value, key, object), may be an
 * iteratee shorthand and defaults to the identity.
 *
 * @param object - The object to inspect.
 * @param predicate - The function invoked per iteration.
 * @returns Returns the key of the matched element, else `undefined`.
 * @internal
 */
export function _findKey<T>(
    object: T | null | undefined,
    predicate?: _ObjectIteratee<T>,
): string | undefined {
    // as in lodash, falsy objects are not inspected at all
    if (!object) {
        return undefined;
    }

    const test = _baseIteratee(predicate) as (value: unknown, key: string, object: _AnyRecord) => unknown;
    const iterable = Object(object) as _AnyRecord;

    for (const key of _keys(object)) {
        if (test(iterable[key], key, iterable)) {
            return key;
        }
    }

    return undefined;
}
