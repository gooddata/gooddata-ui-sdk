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
import { _isIndex } from "./_isIndex.js";
import { _isArguments } from "./isArguments.js";
import { _isArrayLike } from "./isArrayLike.js";
import { _isTypedArray } from "./isTypedArray.js";

/**
 * Creates an array of the own enumerable string keys of `object`. Arrays, arguments objects and typed arrays
 * list every index first, holes included, followed by their other own keys; other array-likes, strings
 * included, list their own keys as they are. Non-object values are coerced to objects.
 *
 * @param object - The object to query.
 * @returns Returns the array of property names.
 * @internal
 */
export function _keys(object: unknown): string[] {
    if (!_isArrayLike(object)) {
        return _baseKeys(object);
    }

    const value = Object(object) as object;
    const indexed = Array.isArray(value) || _isArguments(value) || _isTypedArray(value);
    const length = indexed ? (value as ArrayLike<unknown>).length : 0;
    const result = Array.from({ length }, (_, index) => String(index));

    for (const key of Object.keys(value)) {
        if (!(indexed && (key === "length" || _isIndex(key, length)))) {
            result.push(key);
        }
    }

    return result;
}
