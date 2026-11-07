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

import { _baseSet } from "./_baseSet.js";
import type { _Many, _PropertyName } from "./types.js";

/**
 * @internal
 */
export type _PropertyPath = _Many<_PropertyName>;

/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist, it's created. Arrays are
 * created for missing index properties while objects are created for all other missing properties.
 * The segments `__proto__`, `constructor` and `prototype` are refused, which prevents prototype pollution.
 *
 * **Note:** This method mutates `object`.
 *
 * @param object - The object to modify.
 * @param path - The path of the property to set.
 * @param value - The value to set.
 * @returns Returns `object`.
 * @internal
 */
export function _set<T extends object>(object: T, path: _PropertyPath, value: unknown): T;
/**
 * @see _set
 * @internal
 */
export function _set<TResult>(object: object, path: _PropertyPath, value: unknown): TResult;
export function _set(object: unknown, path: _PropertyPath, value: unknown): unknown {
    return object == null ? object : _baseSet(object, path, value);
}
