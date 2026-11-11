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

import { _baseIteratee } from "./_baseIteratee.js";
import { _baseSum } from "./_baseSum.js";
import type { _List } from "./types.js";

/**
 * This method is like `_sum` except that it accepts `iteratee` which is invoked for each element in `array`
 * to generate the value to be summed. The iteratee is invoked with one argument: (value). Values are added
 * with the `+` operator, `undefined` results are skipped, and, as in lodash, an empty or nullish array
 * yields `0` while an array without any defined result yields `undefined`.
 *
 * @param array - The array to iterate over.
 * @param iteratee - The iteratee invoked per element, or a property shorthand.
 * @returns Returns the sum.
 * @internal
 */
export function _sumBy<T>(
    array: _List<T> | null | undefined,
    iteratee?: ((value: T) => number) | string,
): number {
    return array?.length ? (_baseSum(array, _baseIteratee(iteratee)) as number) : 0;
}
