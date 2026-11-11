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

import { _keys } from "./keys.js";
import type { _Dictionary } from "./types.js";

const nativeObjectToString = Object.prototype.toString;

/**
 * Creates an object composed of the inverted keys and values of `object`. If `object` contains duplicate
 * values, subsequent values overwrite property assignments of previous values. Only own enumerable string
 * keyed properties are inverted. As in lodash, a value is coerced to a property key the way property
 * assignment does it, except that a value without a callable `toString` (such as an object with a null
 * prototype) becomes `[object Object]`; a symbol value becomes a symbol key.
 *
 * @param object - The object to invert.
 * @returns Returns the new inverted object.
 * @internal
 */
export function _invert(object: object): _Dictionary<string> {
    const result: Record<PropertyKey, string> = {};
    const source = Object(object) as Record<string, unknown>;

    for (const key of _keys(object)) {
        const value = source[key] as { toString?: unknown } | null | undefined;
        const hasToString = typeof value?.toString === "function";
        const inverted = value == null || hasToString ? value : nativeObjectToString.call(value);

        result[inverted as PropertyKey] = key;
    }

    return result;
}
