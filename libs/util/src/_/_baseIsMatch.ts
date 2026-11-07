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

import { _baseIsEqual } from "./_baseIsEqual.js";
import type { _MatchData } from "./_getMatchData.js";

/**
 * The base implementation of `isMatch` without support for iteratee shorthands: whether `object` has
 * every property described by `matchData`, comparing strictly where the source value allows it and
 * by a partial, unordered deep comparison otherwise.
 *
 * @param object - The object to inspect.
 * @param matchData - The property names, values, and compare flags to match.
 * @returns Returns `true` if `object` is a match, else `false`.
 * @internal
 */
export function _baseIsMatch(object: unknown, matchData: _MatchData[]): boolean {
    if (object == null) {
        return matchData.length === 0;
    }

    const target = Object(object) as Record<PropertyKey, unknown>;

    // cheap presence and strict-value pass first, so a deep comparison only runs on candidates
    for (const [key, srcValue, isStrict] of matchData) {
        if (isStrict ? srcValue !== target[key] : !(key in target)) {
            return false;
        }
    }

    for (const [key, srcValue, isStrict] of matchData) {
        const objValue = target[key];

        if (isStrict) {
            // an `undefined` source value only matches a key that actually exists
            if (objValue === undefined && !(key in target)) {
                return false;
            }
        } else if (!_baseIsEqual(srcValue, objValue, { partial: true, unordered: true })) {
            return false;
        }
    }

    return true;
}
