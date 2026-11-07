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
import { _baseMatches } from "./_baseMatches.js";
import { _baseMatchesProperty } from "./_baseMatchesProperty.js";
import { _isKey } from "./_isKey.js";
import { _toKey } from "./_toKey.js";

/**
 * The base implementation of `iteratee`: turns any of lodash's iteratee shorthands into a function.
 *
 * - a function is returned as is
 * - `null` or `undefined` becomes the identity function
 * - an array `[path, value]` becomes a `matchesProperty` predicate
 * - any other object becomes a `matches` predicate
 * - anything else is a property name or path and becomes a `property` accessor
 *
 * @param value - The value to convert to an iteratee.
 * @returns Returns the iteratee.
 * @internal
 */
export function _baseIteratee(value: unknown): (object: unknown) => unknown {
    if (typeof value === "function") {
        return value as (object: unknown) => unknown;
    }

    if (value == null) {
        return (object) => object;
    }

    if (typeof value === "object") {
        return Array.isArray(value) ? _baseMatchesProperty(value[0], value[1]) : _baseMatches(value);
    }

    if (_isKey(value)) {
        const key = _toKey(value);

        return (object) => (object == null ? undefined : (object as Record<PropertyKey, unknown>)[key]);
    }

    return (object) => _baseGet(object, value);
}
