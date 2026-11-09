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

import { _baseEach } from "./_baseEach.js";
import { _baseIteratee } from "./_baseIteratee.js";
import type { _List, _ValueIteratee, _ValueIteratorTypeGuard } from "./types.js";

/**
 * Creates an array of elements split into two groups, the first of which contains elements `predicate`
 * returns truthy for, the second of which contains elements `predicate` returns falsey for. The
 * predicate is invoked with one argument: (value).
 *
 * @param collection - The collection to iterate over.
 * @param predicate - The function invoked per iteration.
 * @returns Returns the array of grouped elements.
 * @internal
 */
export function _partition<T, U extends T>(
    collection: _List<T> | null | undefined,
    predicate: _ValueIteratorTypeGuard<T, U>,
): [U[], Array<Exclude<T, U>>];
/**
 * @see _partition
 * @internal
 */
export function _partition<T>(
    collection: _List<T> | null | undefined,
    predicate: _ValueIteratee<T>,
): [T[], T[]];
/**
 * @see _partition
 * @internal
 */
export function _partition<T extends object>(
    collection: T | null | undefined,
    predicate: _ValueIteratee<T[keyof T]>,
): [Array<T[keyof T]>, Array<T[keyof T]>];
export function _partition(collection: unknown, predicate?: unknown): [unknown[], unknown[]] {
    const truthy: unknown[] = [];
    const falsy: unknown[] = [];
    const test = _baseIteratee(predicate);

    _baseEach(collection, (value) => {
        (test(value) ? truthy : falsy).push(value);
    });

    return [truthy, falsy];
}
