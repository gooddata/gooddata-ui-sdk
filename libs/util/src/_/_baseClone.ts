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
import { _baseGetTag } from "./_baseGetTag.js";
import { _cloneArrayBuffer } from "./_cloneArrayBuffer.js";
import { _cloneTypedArray } from "./_cloneTypedArray.js";
import { _getAllKeys } from "./_getAllKeys.js";
import { _initCloneObject } from "./_initCloneObject.js";
import { _isIndex } from "./_isIndex.js";
import { _isObject } from "./isObject.js";
import { _isTypedArray } from "./isTypedArray.js";
import type { _CloneDeepWithCustomizer } from "./types.js";

/** `Object#toString` result references. */
const ARGS_TAG = "[object Arguments]";
const ARRAY_BUFFER_TAG = "[object ArrayBuffer]";
const BOOL_TAG = "[object Boolean]";
const DATA_VIEW_TAG = "[object DataView]";
const DATE_TAG = "[object Date]";
const FUNC_TAG = "[object Function]";
const MAP_TAG = "[object Map]";
const NUMBER_TAG = "[object Number]";
const OBJECT_TAG = "[object Object]";
const REGEXP_TAG = "[object RegExp]";
const SET_TAG = "[object Set]";
const STRING_TAG = "[object String]";
const SYMBOL_TAG = "[object Symbol]";

/** Tags of the non-plain, non-array values that `_initCloneByTag` knows how to clone. */
const CLONEABLE_TAGS = new Set([
    ARRAY_BUFFER_TAG,
    BOOL_TAG,
    DATA_VIEW_TAG,
    DATE_TAG,
    MAP_TAG,
    NUMBER_TAG,
    REGEXP_TAG,
    SET_TAG,
    STRING_TAG,
    SYMBOL_TAG,
]);

/** Used to match `RegExp` flags from their coerced string values. */
const RE_FLAGS = /\w*$/;

/** Tracks each traversed object and its clone, so cycles and shared references are reproduced. */
type _Stack = Map<object, unknown>;

/** The key and container of a nested value, handed to the customizer. */
type _Parent = { key: unknown; object: object };

type _Constructor = new (...args: unknown[]) => unknown;
type _Cloneable = { constructor: _Constructor };
type _AnyRecord = Record<PropertyKey, unknown>;

/**
 * The base implementation of `_clone`, `_cloneDeep` and `_cloneDeepWith` which tracks traversed objects. A
 * shallow clone copies array elements and own enumerable keys by reference and shares the buffer of typed
 * arrays and data views; `Map` and `Set` entries are still shallow-cloned one level, as in lodash. A
 * `customizer` is invoked for every value before it is cloned, with the value alone at the top level and
 * with (value, key, object, stack) below; a result other than `undefined` is used as is.
 *
 * @param value - The value to clone.
 * @param deep - Whether to recursively clone nested values.
 * @param customizer - The function to customize cloning.
 * @param stack - Tracks traversed objects and their clone counterparts.
 * @param parent - The key and container of `value` when it sits inside another value being cloned;
 *  uncloneable nested values are kept by reference while an uncloneable top-level value becomes an empty
 *  object.
 * @returns Returns the cloned value.
 * @internal
 */
export function _baseClone(
    value: unknown,
    deep: boolean,
    customizer?: _CloneDeepWithCustomizer<unknown>,
    stack: _Stack = new Map(),
    parent?: _Parent,
): unknown {
    if (customizer) {
        // symbol keys are passed as they are, although the lodash typing only names string and number keys;
        // the top-level call passes the value alone, which the lodash typing does not express
        const customized = parent
            ? customizer(value, parent.key as number | string, parent.object, stack)
            : (customizer as (value: unknown) => unknown)(value);

        if (customized !== undefined) {
            return customized;
        }
    }

    if (!_isObject(value)) {
        return value;
    }

    const nested = parent !== undefined;

    const isArr = Array.isArray(value);
    const source = value as _AnyRecord;
    let result: _AnyRecord;

    if (isArr) {
        result = _initCloneArray(value);

        if (!deep) {
            // holes become explicit `undefined` entries, extra properties are not copied
            for (let index = 0; index < value.length; index++) {
                result[index] = source[index];
            }

            return result;
        }
    } else {
        const tag = _baseGetTag(value);

        if (tag === OBJECT_TAG || tag === ARGS_TAG || (tag === FUNC_TAG && !nested)) {
            result = tag === FUNC_TAG ? {} : _initCloneObject(value);

            if (!deep) {
                for (const key of _getAllKeys(value)) {
                    _assignValue(result, key, source[key]);
                }

                return result;
            }
        } else if (_isTypedArray(value) || CLONEABLE_TAGS.has(tag)) {
            result = _initCloneByTag(value, tag, deep);
        } else {
            return nested ? value : {};
        }
    }

    const stacked = stack.get(value);

    if (stacked) {
        return stacked;
    }

    stack.set(value, result);

    if (value instanceof Set) {
        const target = result as unknown as Set<unknown>;

        value.forEach((subValue) => {
            target.add(_baseClone(subValue, deep, customizer, stack, { key: subValue, object: value }));
        });
    } else if (value instanceof Map) {
        const target = result as unknown as Map<unknown, unknown>;

        // keys are kept by reference, only values are cloned
        value.forEach((subValue, key) => {
            target.set(key, _baseClone(subValue, deep, customizer, stack, { key, object: value }));
        });
    }

    if (isArr) {
        // holes are visited too and become explicit `undefined` entries in the clone
        for (let index = 0; index < value.length; index++) {
            const cloned = _baseClone(source[index], deep, customizer, stack, {
                key: index,
                object: value,
            });

            _assignValue(result, index, cloned);
        }
    } else {
        // with a customizer the index keys of a typed array are visited too, so elements can be customized
        for (const key of customizer ? _getAllKeys(value) : _ownKeys(value)) {
            const cloned = _baseClone(source[key], deep, customizer, stack, { key, object: value });

            _assignValue(result, key, cloned);
        }
    }

    return result;
}

/**
 * Own enumerable string and symbol keys to copy. Typed arrays skip their index keys, which the clone
 * already holds, so only extra properties set on them are visited.
 */
function _ownKeys(value: object): (string | symbol)[] {
    const keys = _getAllKeys(value);

    if (!_isTypedArray(value)) {
        return keys;
    }

    const length = (value as ArrayLike<unknown>).length;

    return keys.filter((key) => typeof key === "symbol" || !_isIndex(key, length));
}

/**
 * Initializes an array clone of the same class and length, copying the properties `RegExp#exec` adds.
 */
function _initCloneArray(array: unknown[]): _AnyRecord {
    const length = array.length;
    const result = new (array as unknown as _Cloneable).constructor(length) as _AnyRecord;

    if (length && typeof array[0] === "string" && Object.hasOwn(array, "index")) {
        const execResult = array as unknown as _AnyRecord;

        result["index"] = execResult["index"];
        result["input"] = execResult["input"];
    }

    return result;
}

/**
 * Initializes a clone of a value by its `toStringTag`. Collections come back empty and are filled by
 * the caller; everything else is complete on return. A shallow clone of a typed array or data view shares
 * the buffer of the original, an array buffer is always copied.
 */
function _initCloneByTag(object: object, tag: string, deep: boolean): _AnyRecord {
    const Ctor = (object as _Cloneable).constructor;

    switch (tag) {
        case ARRAY_BUFFER_TAG:
            return _cloneArrayBuffer(object as ArrayBuffer) as unknown as _AnyRecord;

        case BOOL_TAG:
        case DATE_TAG:
            return new Ctor(Number(object)) as _AnyRecord;

        case DATA_VIEW_TAG: {
            const view = object as DataView;

            const buffer = deep ? _cloneArrayBuffer(view.buffer) : view.buffer;

            return new Ctor(buffer, view.byteOffset, view.byteLength) as _AnyRecord;
        }

        case MAP_TAG:
        case SET_TAG:
            return new Ctor() as _AnyRecord;

        case NUMBER_TAG:
        case STRING_TAG:
            return new Ctor(object) as _AnyRecord;

        case REGEXP_TAG: {
            const regexp = object as RegExp;
            const result = new Ctor(regexp.source, RE_FLAGS.exec(String(regexp))?.[0]) as RegExp;

            result.lastIndex = regexp.lastIndex;

            return result as unknown as _AnyRecord;
        }

        case SYMBOL_TAG:
            return Object((object as unknown as symbol).valueOf()) as _AnyRecord;
    }

    return _cloneTypedArray(object as ArrayBufferView & ArrayLike<unknown>, deep) as unknown as _AnyRecord;
}
