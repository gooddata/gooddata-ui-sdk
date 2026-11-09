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

import { _baseAssignValue } from "./_baseAssignValue.js";
import { _cloneTypedArray } from "./_cloneTypedArray.js";
import { _initCloneObject } from "./_initCloneObject.js";
import { _eq } from "./eq.js";
import { _isArguments } from "./isArguments.js";
import { _isArrayLike } from "./isArrayLike.js";
import { _isObject } from "./isObject.js";
import { _isObjectLike } from "./isObjectLike.js";
import { _isPlainObject } from "./isPlainObject.js";
import { _isTypedArray } from "./isTypedArray.js";
import { _keysIn } from "./keysIn.js";

type _AnyRecord = Record<PropertyKey, unknown>;

/** Tracks each traversed source value and its merged counterpart, so cycles and shared references are kept. */
type _Stack = Map<unknown, unknown>;

/**
 * The base implementation of `_merge` for a single source: merges the own and inherited enumerable string
 * keyed properties of `source` into `object`.
 *
 * @param object - The destination object.
 * @param source - The source object.
 * @param stack - Tracks traversed source values and their merged counterparts.
 * @internal
 */
export function _baseMerge(object: _AnyRecord, source: _AnyRecord, stack: _Stack): void {
    if (object === source) {
        return;
    }

    for (const key of _keysIn(source)) {
        const srcValue = source[key];

        if (_isObject(srcValue)) {
            _mergeDeep(object, source, key, stack);
        } else {
            _assignMergeValue(object, key, srcValue);
        }
    }
}

/**
 * Merges the object value at `key`: arrays and plain objects are merged recursively into the destination
 * value, typed arrays are copied, and any other object is assigned by reference.
 */
function _mergeDeep(object: _AnyRecord, source: _AnyRecord, key: string, stack: _Stack): void {
    const objValue = _safeGet(object, key);
    const srcValue = _safeGet(source, key);
    const stacked = stack.get(srcValue);

    if (stacked) {
        _assignMergeValue(object, key, stacked);

        return;
    }

    let newValue: unknown = srcValue;
    // whether `srcValue` still has to be merged into `newValue`
    let isCommon = true;

    const isArr = Array.isArray(srcValue);
    const isTyped = !isArr && _isTypedArray(srcValue);

    if (isArr || isTyped) {
        if (Array.isArray(objValue)) {
            newValue = objValue;
        } else if (_isObjectLike(objValue) && _isArrayLike(objValue)) {
            newValue = Array.from(objValue as ArrayLike<unknown>);
        } else if (isTyped) {
            isCommon = false;
            newValue = _cloneTypedArray(srcValue as ArrayBufferView & ArrayLike<unknown>);
        } else {
            newValue = [];
        }
    } else if (_isPlainObject(srcValue) || _isArguments(srcValue)) {
        newValue = objValue;

        if (_isArguments(objValue)) {
            newValue = _toPlainObject(objValue);
        } else if (!_isObject(objValue) || typeof objValue === "function") {
            newValue = _initCloneObject(srcValue as object);
        }
    } else {
        isCommon = false;
    }

    if (isCommon) {
        stack.set(srcValue, newValue);
        _baseMerge(newValue as _AnyRecord, srcValue as _AnyRecord, stack);
        stack.delete(srcValue);
    }

    _assignMergeValue(object, key, newValue);
}

/** Assigns `value` unless it equals the current value, or is `undefined` while the key already exists. */
function _assignMergeValue(object: _AnyRecord, key: string, value: unknown): void {
    if ((value !== undefined && !_eq(object[key], value)) || (value === undefined && !(key in object))) {
        _baseAssignValue(object, key, value);
    }
}

/** Reads `object[key]`, except for `__proto__` and a `constructor` function, which are never merged. */
function _safeGet(object: _AnyRecord, key: string): unknown {
    if (key === "__proto__" || (key === "constructor" && typeof object[key] === "function")) {
        return undefined;
    }

    return object[key];
}

/** Copies the own and inherited enumerable string keyed properties of `value` into a new plain object. */
function _toPlainObject(value: object): _AnyRecord {
    const result: _AnyRecord = {};

    for (const key of _keysIn(value)) {
        _baseAssignValue(result, key, (value as _AnyRecord)[key]);
    }

    return result;
}
