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

import { _castPath } from "./_castPath.js";
import { _isIndex } from "./_isIndex.js";
import { _toKey } from "./_toKey.js";
import { _isArguments } from "./isArguments.js";
import { _isLength } from "./isLength.js";

/**
 * Checks if `path` exists on `object`, testing each segment with `hasFunc`. A missing last segment
 * still counts as present when it is a valid index of a sparse array or an arguments object, since
 * a hole is a slot that exists.
 *
 * @param object - The object to query.
 * @param path - The path to check.
 * @param hasFunc - The function to check a single key on an object.
 * @returns Returns `true` if `path` exists, else `false`.
 * @internal
 */
export function _hasPath(
    object: unknown,
    path: unknown,
    hasFunc: (object: object, key: string | symbol) => boolean,
): boolean {
    const keys = _castPath(path, object as object);
    let current: unknown = object;
    let index = -1;
    let result = false;
    let key: string | symbol = "";

    while (++index < keys.length) {
        key = _toKey(keys[index]);
        result = current != null && hasFunc(Object(current) as object, key);

        if (!result) {
            break;
        }

        current = (current as Record<PropertyKey, unknown>)[key];
    }

    if (result || ++index !== keys.length) {
        return result;
    }

    const length = current == null ? 0 : (current as ArrayLike<unknown>).length;

    return (
        !!length &&
        _isLength(length) &&
        _isIndex(key, length) &&
        (Array.isArray(current) || _isArguments(current))
    );
}
