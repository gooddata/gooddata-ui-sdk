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
import type { _PropertyPath } from "./set.js";
import type { _NumericDictionary } from "./types.js";

/**
 * Gets the value at `path` of `object`. If the resolved value is `undefined`, the `defaultValue` is returned
 * in its place; `null` and other values are returned as they are. Paths may be dotted or bracketed strings,
 * arrays of keys, symbols or numbers, and a key that exists on `object` is read directly instead of being
 * parsed as a path, as in lodash.
 *
 * Unlike the lodash typings, string paths are not typed by their segments; they resolve to `any`.
 *
 * @param object - The object to query.
 * @param path - The path of the property to get.
 * @param defaultValue - The value returned for `undefined` resolved values.
 * @returns Returns the resolved value.
 * @internal
 */
export function _get<TObject extends object, TKey extends keyof TObject>(
    object: TObject,
    path: TKey | [TKey],
): TObject[TKey];
/**
 * @internal
 */
export function _get<TObject extends object, TKey extends keyof TObject>(
    object: TObject | null | undefined,
    path: TKey | [TKey],
): TObject[TKey] | undefined;
/**
 * @internal
 */
export function _get<TObject extends object, TKey extends keyof TObject, TDefault>(
    object: TObject | null | undefined,
    path: TKey | [TKey],
    defaultValue: TDefault,
): Exclude<TObject[TKey], undefined> | TDefault;
/**
 * @internal
 */
export function _get<TObject extends object, TKey1 extends keyof TObject, TKey2 extends keyof TObject[TKey1]>(
    object: TObject,
    path: [TKey1, TKey2],
): TObject[TKey1][TKey2];
/**
 * @internal
 */
export function _get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof NonNullable<TObject[TKey1]>,
>(object: TObject | null | undefined, path: [TKey1, TKey2]): NonNullable<TObject[TKey1]>[TKey2] | undefined;
/**
 * @internal
 */
export function _get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof NonNullable<TObject[TKey1]>,
    TDefault,
>(
    object: TObject | null | undefined,
    path: [TKey1, TKey2],
    defaultValue: TDefault,
): Exclude<NonNullable<TObject[TKey1]>[TKey2], undefined> | TDefault;
/**
 * @internal
 */
export function _get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof TObject[TKey1],
    TKey3 extends keyof TObject[TKey1][TKey2],
>(object: TObject, path: [TKey1, TKey2, TKey3]): TObject[TKey1][TKey2][TKey3];
/**
 * @internal
 */
export function _get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof NonNullable<TObject[TKey1]>,
    TKey3 extends keyof NonNullable<NonNullable<TObject[TKey1]>[TKey2]>,
>(
    object: TObject | null | undefined,
    path: [TKey1, TKey2, TKey3],
): NonNullable<NonNullable<TObject[TKey1]>[TKey2]>[TKey3] | undefined;
/**
 * @internal
 */
export function _get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof NonNullable<TObject[TKey1]>,
    TKey3 extends keyof NonNullable<NonNullable<TObject[TKey1]>[TKey2]>,
    TDefault,
>(
    object: TObject | null | undefined,
    path: [TKey1, TKey2, TKey3],
    defaultValue: TDefault,
): Exclude<NonNullable<NonNullable<TObject[TKey1]>[TKey2]>[TKey3], undefined> | TDefault;
/**
 * @internal
 */
export function _get<
    TObject extends object,
    TKey1 extends keyof TObject,
    TKey2 extends keyof TObject[TKey1],
    TKey3 extends keyof TObject[TKey1][TKey2],
    TKey4 extends keyof TObject[TKey1][TKey2][TKey3],
>(object: TObject, path: [TKey1, TKey2, TKey3, TKey4]): TObject[TKey1][TKey2][TKey3][TKey4];
/**
 * @internal
 */
export function _get<T>(object: _NumericDictionary<T>, path: number): T;
/**
 * @internal
 */
export function _get<T>(object: _NumericDictionary<T> | null | undefined, path: number): T | undefined;
/**
 * @internal
 */
export function _get<T, TDefault>(
    object: _NumericDictionary<T> | null | undefined,
    path: number,
    defaultValue: TDefault,
): T | TDefault;
/**
 * @internal
 */
export function _get<TDefault>(
    object: null | undefined,
    path: _PropertyPath,
    defaultValue: TDefault,
): TDefault;
/**
 * @internal
 */
export function _get(object: null | undefined, path: _PropertyPath): undefined;
/**
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash catch-all signature
export function _get(object: any, path: _PropertyPath, defaultValue?: any): any;
export function _get(object: unknown, path?: unknown, defaultValue?: unknown): unknown {
    const result = object == null ? undefined : _baseGet(object, path);

    return result === undefined ? defaultValue : result;
}
