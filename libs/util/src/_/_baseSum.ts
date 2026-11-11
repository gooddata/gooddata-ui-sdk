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

/**
 * The base implementation of `_sumBy`: adds the iteratee results of `array` with the `+` operator, skipping
 * `undefined` results. As in lodash, the sum is `undefined` when no result was added.
 *
 * @param array - The array to iterate over.
 * @param iteratee - The function invoked per element.
 * @returns Returns the sum.
 * @internal
 */
export function _baseSum<T>(array: _List<T>, iteratee: (value: T) => unknown): unknown {
    let result: unknown;

    for (let index = 0; index < array.length; index++) {
        const current = iteratee(array[index] as T);

        if (current !== undefined) {
            // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- `+` on any value, as in lodash
            result = result === undefined ? current : (result as any) + current;
        }
    }

    return result;
}
