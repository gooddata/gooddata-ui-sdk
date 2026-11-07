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

/** Used to detect unsigned integer values. */
const RE_IS_UINT = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index: a non-negative integer, or a string spelling one without
 * leading zeros, below `length`.
 *
 * @param value - The value to check.
 * @param length - The upper bound of a valid index, `Number.MAX_SAFE_INTEGER` when not given.
 * @returns Returns `true` if `value` is a valid index, else `false`.
 * @internal
 */
export function _isIndex(value: unknown, length?: number | null): boolean {
    const type = typeof value;
    const max = length ?? Number.MAX_SAFE_INTEGER;

    if (!max || (type !== "number" && (type === "symbol" || !RE_IS_UINT.test(String(value))))) {
        return false;
    }

    const index = Number(value);

    return index > -1 && index % 1 === 0 && index < max;
}
