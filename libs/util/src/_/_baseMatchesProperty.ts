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

import { _baseGet } from "./_baseGet.js";
import { _baseIsEqual } from "./_baseIsEqual.js";
import { _hasPath } from "./_hasPath.js";
import { _isKey } from "./_isKey.js";
import { _isStrictComparable } from "./_isStrictComparable.js";
import { _matchesStrictComparable } from "./_matchesStrictComparable.js";
import { _toKey } from "./_toKey.js";

/**
 * The base implementation of `matchesProperty` which doesn't clone `srcValue`: creates a predicate
 * that tells whether the value at `path` of an object matches `srcValue`.
 *
 * @param path - The path of the property to get.
 * @param srcValue - The value to match.
 * @returns Returns the new spec function.
 * @internal
 */
export function _baseMatchesProperty(path: unknown, srcValue: unknown): (object: unknown) => boolean {
    if (_isKey(path) && _isStrictComparable(srcValue)) {
        return _matchesStrictComparable(_toKey(path), srcValue);
    }

    return (object) => {
        const objValue = object == null ? undefined : _baseGet(object, path);

        // an `undefined` source value only matches a path that actually exists, own or inherited
        return objValue === undefined && objValue === srcValue
            ? _hasPath(object, path, (target, key) => key in target)
            : _baseIsEqual(srcValue, objValue, { partial: true, unordered: true });
    };
}
