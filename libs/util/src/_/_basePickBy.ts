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

import { _getAllKeysIn } from "./_getAllKeysIn.js";

type _AnyRecord = Record<PropertyKey, unknown>;

/**
 * The base implementation of `_pickBy`: creates an object composed of the own and inherited enumerable
 * string and symbol keyed properties of `object` that `predicate` returns truthy for. The predicate is
 * invoked with two arguments: (value, key). Picked values are kept by reference.
 *
 * @param object - The source object.
 * @param predicate - The function invoked per property.
 * @returns Returns the new object.
 * @internal
 */
export function _basePickBy(
    object: unknown,
    predicate: (value: unknown, key: string | symbol) => unknown,
): _AnyRecord {
    const result: _AnyRecord = {};

    if (object == null) {
        return result;
    }

    const source = Object(object) as _AnyRecord;

    for (const key of _getAllKeysIn(source)) {
        const value = source[key];

        // keys that would change the prototype of the result are never written, as in lodash
        if (predicate(value, key) && key !== "__proto__" && key !== "constructor" && key !== "prototype") {
            result[key] = value;
        }
    }

    return result;
}
