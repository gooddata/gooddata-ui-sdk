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

import type { _List } from "./types.js";

/** Common interface between Arrays and jQuery objects */

/**
 * @internal
 */
export type _Falsey = null | undefined | false | "" | 0 | 0n;

/**
 * Creates an array with all falsey values removed. The values `false`, `null`, `0`, `-0`, `0n`, `""`,
 * `undefined`, and `NaN` are falsey. Holes in sparse arrays are skipped as well.
 *
 * @param array - The array or array-like to _compact.
 * @returns Returns the new array of filtered values.
 * @internal
 */
export function _compact<T>(array: _List<T | _Falsey> | null | undefined): T[] {
    const result: T[] = [];

    if (array == null) {
        return result;
    }

    // a plain index loop, not `filter`, so a non-integer `length` is honoured the way lodash does
    for (let index = 0; index < array.length; index++) {
        const value = array[index];

        if (value) {
            result.push(value);
        }
    }

    return result;
}
