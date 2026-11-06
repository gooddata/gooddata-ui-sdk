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

import { _baseIsMatch } from "./_baseIsMatch.js";
import { _getMatchData } from "./_getMatchData.js";
import { _matchesStrictComparable } from "./_matchesStrictComparable.js";

/**
 * The base implementation of `matches` which doesn't clone `source`: creates a predicate that tells
 * whether an object has the same values as `source` for all of `source`'s own enumerable keys.
 *
 * @param source - The object of property values to match.
 * @returns Returns the new spec function.
 * @internal
 */
export function _baseMatches(source: object): (object: unknown) => boolean {
    const matchData = _getMatchData(source);
    const [single] = matchData;

    if (matchData.length === 1 && single?.[2]) {
        return _matchesStrictComparable(single[0], single[1]);
    }

    return (object) => object === source || _baseIsMatch(object, matchData);
}
