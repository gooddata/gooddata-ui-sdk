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

import { _toNumber } from "./toNumber.js";

/**
 * Clamps `number` within the inclusive `lower` and `upper` bounds. With two arguments the second one is the
 * upper bound. The upper bound is applied first, bounds that convert to `NaN` count as `0`, an `undefined`
 * bound is skipped, and a `NaN` number is returned as is.
 *
 * @param number - The number to clamp.
 * @param lower - The lower bound.
 * @param upper - The upper bound.
 * @returns Returns the clamped number.
 * @internal
 */
export function _clamp(number: number, lower: number, upper: number): number;
/**
 * @internal
 */
export function _clamp(number: number, upper: number): number;
export function _clamp(number: number, lower: number | undefined, upper?: number): number {
    if (upper === undefined) {
        upper = lower;
        lower = undefined;
    }

    const max = upper === undefined ? undefined : _toBound(upper);
    const min = lower === undefined ? undefined : _toBound(lower);
    let result = _toNumber(number);

    if (result !== result) {
        return result;
    }

    if (max !== undefined) {
        result = result <= max ? result : max;
    }

    if (min !== undefined) {
        result = result >= min ? result : min;
    }

    return result;
}

/** Converts a bound to a number, `NaN` counting as `0`. */
function _toBound(bound: number): number {
    const converted = _toNumber(bound);

    return converted === converted ? converted : 0;
}
