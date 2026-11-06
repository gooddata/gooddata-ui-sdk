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

import { _baseGetTag } from "./_baseGetTag.js";
import { _baseKeys } from "./_baseKeys.js";
import { _isArguments } from "./isArguments.js";
import { _isArrayLike } from "./isArrayLike.js";
import { _isTypedArray } from "./isTypedArray.js";
import type { _List } from "./types.js";

/** Common interface between Arrays and jQuery objects */

/**
 * @internal
 */
export type _EmptyObject<T> = { [K in keyof T]?: never };

/**
 * @internal
 */
export type _EmptyObjectOf<T> = _EmptyObject<T> extends T ? _EmptyObject<T> : never;

/** `Object#toString` result references. */
const MAP_TAG = "[object Map]";
const SET_TAG = "[object Set]";

/**
 * Checks if value is empty. A value is considered empty unless it’s an arguments object, array, string, or
 * jQuery-like collection with a length greater than 0 or an object with own enumerable properties.
 *
 * @param value - The value to inspect.
 * @returns Returns true if value is empty, else false.
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function _isEmpty<T extends { __trapAny: any }>(value?: T): boolean;
/**
 * @see _isEmpty
 * @internal
 */
export function _isEmpty(value: string): value is "";
/**
 * @see _isEmpty
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function _isEmpty(value: Map<any, any> | Set<any> | _List<any> | null | undefined): boolean;
/**
 * @see _isEmpty
 * @internal
 */
export function _isEmpty(value: object): boolean;
/**
 * @see _isEmpty
 * @internal
 */
export function _isEmpty<T extends object>(
    value: T | null | undefined,
): value is _EmptyObjectOf<T> | null | undefined;
/**
 * @see _isEmpty
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function _isEmpty(value?: any): boolean;
export function _isEmpty(value?: unknown): boolean {
    if (value == null) {
        return true;
    }

    if (
        _isArrayLike(value) &&
        (Array.isArray(value) ||
            typeof value === "string" ||
            typeof (value as { splice?: unknown }).splice === "function" ||
            _isTypedArray(value) ||
            _isArguments(value))
    ) {
        return !value.length;
    }

    const tag = _baseGetTag(value);

    if (tag === MAP_TAG || tag === SET_TAG) {
        return !(value as { size: number }).size;
    }

    return _baseKeys(value).length === 0;
}
