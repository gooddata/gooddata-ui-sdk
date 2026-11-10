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

import { _isObject } from "./isObject.js";
import { _isSymbol } from "./isSymbol.js";

/** Used to detect bad signed hexadecimal string values. */
const RE_IS_BAD_HEX = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
const RE_IS_BINARY = /^0b[01]+$/i;

/** Used to detect octal string values. */
const RE_IS_OCTAL = /^0o[0-7]+$/i;

/**
 * Converts `value` to a number. Symbols become `NaN`, objects are converted through `valueOf`, and strings
 * are trimmed and may use the `0b`, `0o` and `0x` prefixes; a signed hexadecimal string becomes `NaN`.
 * A bigint throws, as the numeric coercion does.
 *
 * @param value - The value to process.
 * @returns Returns the number.
 * @internal
 */
export function _toNumber(value: unknown): number {
    if (typeof value === "number") {
        return value;
    }

    if (_isSymbol(value)) {
        return NaN;
    }

    if (_isObject(value)) {
        const other = typeof value.valueOf === "function" ? value.valueOf() : value;

        value = _isObject(other) ? String(other) : other;
    }

    if (typeof value !== "string") {
        return value === 0 ? value : +(value as number);
    }

    const trimmed = value.trim();
    const isBinary = RE_IS_BINARY.test(trimmed);

    if (isBinary || RE_IS_OCTAL.test(trimmed)) {
        return parseInt(trimmed.slice(2), isBinary ? 2 : 8);
    }

    return RE_IS_BAD_HEX.test(trimmed) ? NaN : +trimmed;
}
