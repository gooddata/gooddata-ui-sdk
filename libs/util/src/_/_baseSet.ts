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
import { _castPath } from "./_castPath.js";
import { _isIndex } from "./_isIndex.js";
import { _toKey } from "./_toKey.js";
import { _isObject } from "./isObject.js";

/**
 * The base implementation of `set`.
 *
 * @param object - The object to modify.
 * @param path - The path of the property to set.
 * @param value - The value to set.
 * @returns Returns `object`.
 * @internal
 */
export function _baseSet(object: unknown, path: unknown, value: unknown): unknown {
    if (!_isObject(object)) {
        return object;
    }

    const keys = _castPath(path, object);
    const lastIndex = keys.length - 1;
    let nested = object as Record<PropertyKey, unknown>;

    for (let index = 0; nested != null && index < keys.length; index++) {
        const key = _toKey(keys[index]);

        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return object;
        }

        let newValue = value;

        if (index !== lastIndex) {
            const objValue = nested[key];

            // keep an existing container, otherwise create an array for an index segment and an object otherwise
            newValue = _isObject(objValue) ? objValue : _isIndex(keys[index + 1]) ? [] : {};
        }

        _assignValue(nested, key, newValue);
        nested = nested[key] as Record<PropertyKey, unknown>;
    }

    return object;
}
