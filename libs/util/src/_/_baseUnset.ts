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

import { _baseGet } from "./_baseGet.js";
import { _castPath } from "./_castPath.js";
import { _toKey } from "./_toKey.js";

/**
 * The base implementation of `unset`.
 *
 * Refuses `__proto__` anywhere in the path unless it is an own key, and `constructor` or `prototype`
 * as intermediate segments, so a path can never escape the object graph into built-ins.
 *
 * @param object - The object to modify.
 * @param path - The property path to unset.
 * @returns Returns `true` if the property is deleted or absent, else `false`.
 * @internal
 */
export function _baseUnset(object: object, path: unknown): boolean {
    const keys = _castPath(path, object);

    if (keys.length === 0) {
        return true;
    }

    for (let index = 0; index < keys.length; index++) {
        const key = _toKey(keys[index]);

        if (key === "__proto__" && !Object.hasOwn(object, "__proto__")) {
            return false;
        }

        if ((key === "constructor" || key === "prototype") && index < keys.length - 1) {
            return false;
        }
    }

    const parent = keys.length < 2 ? object : _baseGet(object, keys.slice(0, -1));

    return parent == null || delete (parent as Record<PropertyKey, unknown>)[_toKey(keys[keys.length - 1])];
}
