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

import { _assignValue } from "./_assignValue.js";
import { _isIterateeCall } from "./_isIterateeCall.js";
import { _keysIn } from "./keysIn.js";

type _AnyRecord = Record<PropertyKey, unknown>;

/**
 * This method is like `_assign` except that it iterates over own and inherited source properties: it
 * assigns the own and inherited enumerable string keyed properties of the source objects to the destination
 * object, left to right, so later sources overwrite earlier ones. Falsy sources are skipped, array-like
 * sources are copied by index, and a nullish destination becomes a new object while a primitive one is boxed.
 *
 * **Note:** This method mutates `object`.
 *
 * @param object - The destination object.
 * @param sources - The source objects.
 * @returns Returns `object`.
 * @internal
 */
export function _assignIn<TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
/**
 * @internal
 */
export function _assignIn<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
): TObject & TSource1 & TSource2;
/**
 * @internal
 */
export function _assignIn<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
): TObject & TSource1 & TSource2 & TSource3;
/**
 * @internal
 */
export function _assignIn<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
): TObject & TSource1 & TSource2 & TSource3 & TSource4;
/**
 * @internal
 */
export function _assignIn<TObject>(object: TObject): TObject;
/**
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash catch-all signature
export function _assignIn<TResult>(object: any, ...otherArgs: any[]): TResult;
export function _assignIn(object?: unknown, ...sources: unknown[]): unknown {
    const target = Object(object) as _AnyRecord;
    // when called as an iteratee, e.g. by `reduce`, only the value is a source, not the index and collection
    const length =
        sources.length > 2 && _isIterateeCall(sources[0], sources[1], sources[2]) ? 1 : sources.length;

    for (let index = 0; index < length; index++) {
        const source = sources[index];

        if (!source) {
            continue;
        }

        const from = Object(source) as _AnyRecord;

        for (const key of _keysIn(source)) {
            _assignValue(target, key, from[key]);
        }
    }

    return target;
}
