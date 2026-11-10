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

/**
 * Converts `value` to a string. An empty string is returned for `null` and `undefined` values. The sign of
 * `-0` is preserved, symbols are converted through their `toString`, and arrays are converted element by
 * element and joined with commas.
 *
 * @param value - The value to convert.
 * @returns Returns the converted string.
 * @internal
 */
export function _toString(value: unknown): string {
    return value == null ? "" : _baseToString(value);
}

function _baseToString(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(_baseToString).join(",");
    }

    if (_isSymbol(value)) {
        return Symbol.prototype.toString.call(value);
    }

    const result = String(value);

    return result === "0" && 1 / (value as number) === -Infinity ? "-0" : result;
}
