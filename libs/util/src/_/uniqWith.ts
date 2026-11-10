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

import { _baseUniq } from "./_baseUniq.js";
import type { _Comparator, _List } from "./types.js";

/**
 * This method is like `_uniq` except that it accepts `comparator` which is invoked to compare elements of
 * `array`. The order of result values is determined by the order they occur in the array. The comparator
 * is invoked with two arguments: (arrVal, othVal), the candidate first and then each kept element in order.
 * Without a function comparator, elements are compared with SameValueZero.
 *
 * @param array - The array to inspect.
 * @param comparator - The comparator invoked per element.
 * @returns Returns the new duplicate free array.
 * @internal
 */
export function _uniqWith<T>(array: _List<T> | null | undefined, comparator?: _Comparator<T>): T[] {
    if (!array?.length) {
        return [];
    }

    if (typeof comparator !== "function") {
        return _baseUniq(array);
    }

    const result: T[] = [];

    for (let index = 0; index < array.length; index++) {
        const value = array[index] as T;

        if (!result.some((kept) => comparator(value, kept))) {
            result.push(value);
        }
    }

    return result;
}
