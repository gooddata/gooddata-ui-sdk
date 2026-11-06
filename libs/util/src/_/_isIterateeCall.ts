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

import { _isIndex } from "./_isIndex.js";
import { _eq } from "./eq.js";
import { _isArrayLike } from "./isArrayLike.js";
import { _isObject } from "./isObject.js";

/**
 * Checks if the given arguments are from an iteratee call, that is `(value, index, collection)` where
 * `collection[index]` is `value`. Functions with optional numeric arguments use it to behave when
 * passed directly as a callback, for example `[2, 3].map(range)`.
 *
 * @param value - The potential iteratee value argument.
 * @param index - The potential iteratee index or key argument.
 * @param object - The potential iteratee object argument.
 * @returns Returns `true` if the arguments are from an iteratee call, else `false`.
 * @internal
 */
export function _isIterateeCall(value: unknown, index: unknown, object: unknown): boolean {
    if (!_isObject(object)) {
        return false;
    }

    const isKeyOf =
        typeof index === "number"
            ? _isArrayLike(object) && _isIndex(index, (object as ArrayLike<unknown>).length)
            : typeof index === "string" && index in object;

    return isKeyOf && _eq((object as Record<PropertyKey, unknown>)[index as PropertyKey], value);
}
