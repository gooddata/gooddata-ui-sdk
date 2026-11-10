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

import { _hasPath } from "./_hasPath.js";
import type { _PropertyPath } from "./set.js";
import type { _PropertyName } from "./types.js";

declare const uniqueSymbol: unique symbol;

/**
 * Checks if `path` is a direct property of `object`: every segment of the path must be an own property of
 * the value before it, or a valid index of an array or arguments object.
 *
 * @param object - The object to query.
 * @param path - The path to check.
 * @returns Returns `true` if `path` exists, else `false`.
 * @internal
 */
export function _has<T, K extends _PropertyName>(
    object: T,
    path: K,
): object is T & {
    [P in K]: P extends keyof T ? T[P] : Record<string, unknown> extends T ? T[keyof T] : unknown;
} & { [uniqueSymbol]: unknown };
/**
 * @internal
 */
export function _has<T>(object: T, path: _PropertyPath): boolean;
export function _has(object: unknown, path: unknown): boolean {
    return object != null && _hasPath(object, path, (target, key) => Object.hasOwn(target, key));
}
