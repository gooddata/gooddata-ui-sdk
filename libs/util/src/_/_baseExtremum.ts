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
import type { _List } from "./types.js";

/**
 * The base implementation of methods like `_max` and `_min` which accepts a `comparator` to determine the
 * extremum value. Elements whose criterion is nullish, `NaN` or a symbol never seed the result; once a
 * result is seeded every later criterion is passed to the comparator. The `length` of `array` is used as
 * is, as in lodash.
 *
 * @param array - The array to iterate over.
 * @param iteratee - The iteratee invoked per element to produce its criterion.
 * @param comparator - Returns `true` when `current` should replace `computed` as the extremum.
 * @returns Returns the extremum element, or `undefined` when there is none.
 * @internal
 */
export function _baseExtremum<T, TCriterion>(
    array: _List<T>,
    iteratee: (value: T) => TCriterion,
    comparator: (current: TCriterion, computed: TCriterion) => boolean,
): T | undefined {
    const length = array.length;
    let computed: TCriterion | undefined;
    let result: T | undefined;

    for (let index = 0; index < length; index++) {
        const value = array[index] as T;
        const current = iteratee(value);

        if (current == null) {
            continue;
        }

        const replaces =
            computed === undefined
                ? !Number.isNaN(current) && !_isSymbol(current)
                : comparator(current, computed);

        if (replaces) {
            computed = current;
            result = value;
        }
    }

    return result;
}
