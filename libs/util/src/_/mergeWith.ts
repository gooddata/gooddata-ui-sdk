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

import { _baseMerge } from "./_baseMerge.js";
import { _isIterateeCall } from "./_isIterateeCall.js";
import type { _MergeWithCustomizer } from "./types.js";

type _AnyRecord = Record<PropertyKey, unknown>;

/**
 * This method is like `_merge` except that it accepts `customizer` which is invoked to produce the merged
 * values of the destination and source properties. If `customizer` returns `undefined`, merging is handled
 * by the method instead. The `customizer` is invoked with six arguments: (objValue, srcValue, key, object,
 * source, stack). It is taken from the last argument when that is a function preceded by at least one
 * source.
 *
 * **Note:** This method mutates `object`.
 *
 * @param object - The destination object.
 * @param source - The source object.
 * @param customizer - The function to customize assigned values.
 * @returns Returns `object`.
 * @internal
 */
export function _mergeWith<TObject, TSource>(
    object: TObject,
    source: TSource,
    customizer: _MergeWithCustomizer,
): TObject & TSource;
/**
 * @internal
 */
export function _mergeWith<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    customizer: _MergeWithCustomizer,
): TObject & TSource1 & TSource2;
/**
 * @internal
 */
export function _mergeWith<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    customizer: _MergeWithCustomizer,
): TObject & TSource1 & TSource2 & TSource3;
/**
 * @internal
 */
export function _mergeWith<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4,
    customizer: _MergeWithCustomizer,
): TObject & TSource1 & TSource2 & TSource3 & TSource4;
/**
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash catch-all signature
export function _mergeWith(object: any, ...otherArgs: any[]): any;
export function _mergeWith(object: unknown, ...args: unknown[]): unknown {
    const target = Object(object) as _AnyRecord;
    const last = args[args.length - 1];
    const customizer =
        args.length > 1 && typeof last === "function" ? (last as _MergeWithCustomizer) : undefined;
    let length = customizer ? args.length - 1 : args.length;

    // when called as an iteratee, e.g. by `reduce`, only the value is a source, not the index and collection
    if (args.length > 2 && _isIterateeCall(args[0], args[1], args[2])) {
        length = 1;
    }

    for (let index = 0; index < length; index++) {
        const source = args[index];

        if (source) {
            _baseMerge(target, Object(source) as _AnyRecord, new Map(), customizer);
        }
    }

    return target;
}
