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
import { _basePickBy } from "./_basePickBy.js";
import type { _Dictionary, _NumericDictionary, _PartialObject, _ValueKeyIteratee } from "./types.js";

/**
 * The opposite of `pickBy`; this method creates an object composed of the own and inherited enumerable
 * string and symbol keyed properties of `object` that `predicate` doesn't return truthy for. The predicate
 * is invoked with two arguments: (value, key). Picked values are kept by reference.
 *
 * @param object - The source object.
 * @param predicate - The function invoked per property, or an iteratee shorthand. Defaults to identity.
 * @returns Returns the new object.
 * @internal
 */
export function _omitBy<T>(
    object: _Dictionary<T> | null | undefined,
    predicate?: _ValueKeyIteratee<T>,
): _Dictionary<T>;
/**
 * @internal
 */
export function _omitBy<T>(
    object: _NumericDictionary<T> | null | undefined,
    predicate?: _ValueKeyIteratee<T>,
): _NumericDictionary<T>;
/**
 * @internal
 */
export function _omitBy<T extends object>(
    object: T | null | undefined,
    predicate: _ValueKeyIteratee<T[keyof T]>,
): _PartialObject<T>;
export function _omitBy(object: unknown, predicate?: unknown): object {
    const matches = _baseIteratee(predicate) as (value: unknown, key: string | symbol) => unknown;

    return _basePickBy(object, (value, key) => !matches(value, key));
}
