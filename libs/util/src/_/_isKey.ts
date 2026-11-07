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

import { _isSymbol } from "./isSymbol.js";

/** Used to match property names within property paths. */
const RE_IS_DEEP_PROP = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const RE_IS_PLAIN_PROP = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path. Anything that is not a string is a
 * name; a string is a name unless it contains dots or bracket segments, except when `object` already
 * has it as a key.
 *
 * @param value - The value to check.
 * @param object - The object to query keys on.
 * @returns Returns `true` if `value` is a property name, else `false`.
 * @internal
 */
export function _isKey(value: unknown, object?: object): boolean {
    if (Array.isArray(value)) {
        return false;
    }

    const type = typeof value;

    if (type === "number" || type === "symbol" || type === "boolean" || value == null || _isSymbol(value)) {
        return true;
    }

    const name = String(value);

    return (
        RE_IS_PLAIN_PROP.test(name) ||
        !RE_IS_DEEP_PROP.test(name) ||
        (object != null && name in Object(object))
    );
}
