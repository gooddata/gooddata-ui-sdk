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
 * Compares values to sort them in ascending order. Ordinary values come first, compared with `<` and `>`,
 * followed by symbols, `null`, `undefined` and `NaN`, in that order. Values of the same group that are
 * neither smaller nor greater than each other compare as equal.
 *
 * @param value - The value to compare.
 * @param other - The other value to compare.
 * @returns Returns the sort order indicator for `value`.
 * @internal
 */
export function _compareAscending(value: unknown, other: unknown): number {
    if (value === other) {
        return 0;
    }

    const valueRank = _rank(value);
    const otherRank = _rank(other);

    if (valueRank !== otherRank) {
        return valueRank < otherRank ? -1 : 1;
    }

    // only ordinary values are compared to each other; the relational operators handle any type pair
    if (valueRank === 0) {
        if ((value as number) > (other as number)) {
            return 1;
        }

        if ((value as number) < (other as number)) {
            return -1;
        }
    }

    return 0;
}

function _rank(value: unknown): number {
    if (_isSymbol(value)) {
        return 1;
    }

    if (value === null) {
        return 2;
    }

    if (value === undefined) {
        return 3;
    }

    // NaN is the only value that is not equal to itself
    if (value !== value) {
        return 4;
    }

    return 0;
}
