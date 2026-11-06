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

import { _isIterateeCall } from "./_isIterateeCall.js";
import { _toFinite } from "./toFinite.js";

/**
 * Creates an array of numbers (positive and/or negative) progressing from `start` up to, but not
 * including, `end`. A step of `-1` is used if a negative `start` is specified without an `end` or
 * `step`. If `end` is not specified, it's set to `start` with `start` then set to `0`.
 *
 * **Note:** JavaScript follows the IEEE-754 standard for resolving floating-point values which can
 * produce unexpected results.
 *
 * @param start - The start of the range.
 * @param end - The end of the range.
 * @param step - The value to increment or decrement by.
 * @returns Returns the range of numbers.
 * @internal
 */
export function _range(start: number, end?: number, step?: number): number[];
/**
 * The iteratee form, so that `_range` can be passed straight to `map` and the like: the index and the
 * collection are ignored and `end` alone defines the range.
 *
 * @see _range
 * @internal
 */
export function _range(end: number, index: string | number, guard: object): number[];
export function _range(start: unknown, end?: unknown, step?: unknown): number[] {
    if (step && typeof step !== "number" && _isIterateeCall(start, end, step)) {
        end = step = undefined;
    }

    // `_toFinite` keeps the sign of `-0`
    let from = _toFinite(start);
    let to: number;

    if (end === undefined) {
        to = from;
        from = 0;
    } else {
        to = _toFinite(end);
    }

    const by = step === undefined ? (from < to ? 1 : -1) : _toFinite(step);
    const length = Math.max(Math.ceil((to - from) / (by || 1)), 0);
    const result: number[] = [];

    for (let index = 0; index < length; index++) {
        result.push(from);
        from += by;
    }

    return result;
}
