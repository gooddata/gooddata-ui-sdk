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
import { _getAllKeys } from "./_getAllKeys.js";
import { _isIndex } from "./_isIndex.js";
import { _isPrototype } from "./_isPrototype.js";
import { _isObject } from "./isObject.js";
import { _isTypedArray } from "./isTypedArray.js";

/** `Object#toString` result references. */
const ARGS_TAG = "[object Arguments]";
const ARRAY_BUFFER_TAG = "[object ArrayBuffer]";
const BOOL_TAG = "[object Boolean]";
const DATA_VIEW_TAG = "[object DataView]";
const DATE_TAG = "[object Date]";
const FUNC_TAG = "[object Function]";
const GEN_TAG = "[object GeneratorFunction]";
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

type _Constructor = new (...args: unknown[]) => unknown;
type _Cloneable = { constructor: _Constructor };
type _AnyRecord = Record<PropertyKey, unknown>;

/** Node's `Buffer`, when present; typed structurally because this package has no Node typings. */
const NodeBuffer = (
    globalThis as { Buffer?: { isBuffer(value: unknown): boolean; from(value: Uint8Array): Uint8Array } }
).Buffer;

/**
 * The base implementation of `_cloneDeep` which tracks traversed objects.
 *
 * @param value - The value to clone.
 * @param stack - Tracks traversed objects and their clone counterparts.
 * @param nested - Whether `value` sits inside another value being cloned; uncloneable nested values are
 *  kept by reference while an uncloneable top-level value becomes an empty object.
 * @returns Returns the cloned value.
 * @internal
 */
export function _baseClone(value: unknown, stack: _Stack = new Map(), nested = false): unknown {
    if (!_isObject(value)) {
        return value;
    }

    const isArr = Array.isArray(value);
    let result: _AnyRecord;

    if (isArr) {
        result = _initCloneArray(value);
    } else {
        const tag = _baseGetTag(value);

        if (tag === OBJECT_TAG || tag === ARGS_TAG) {
            result = _initCloneObject(value);
        } else if (tag === FUNC_TAG || tag === GEN_TAG) {
            if (nested) {
                return value;
            }

            result = {};
        } else if (_isTypedArray(value) || CLONEABLE_TAGS.has(tag)) {
            result = _initCloneByTag(value, tag);
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
            target.add(_baseClone(subValue, stack, true));
        });
    } else if (value instanceof Map) {
        const target = result as unknown as Map<unknown, unknown>;

        // keys are kept by reference, only values are cloned
        value.forEach((subValue, key) => {
            target.set(key, _baseClone(subValue, stack, true));
        });
    }

    const source = value as _AnyRecord;

    if (isArr) {
        // holes are visited too and become explicit `undefined` entries in the clone
        for (let index = 0; index < value.length; index++) {
            _assignValue(result, index, _baseClone(source[index], stack, true));
        }
    } else {
        for (const key of _ownKeys(value)) {
            _assignValue(result, key, _baseClone(source[key], stack, true));
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
 * Initializes a plain-object clone with the same prototype. Prototype objects and objects without a
 * constructor function, such as null-prototype objects, clone into ordinary `Object` instances.
 */
function _initCloneObject(object: object): _AnyRecord {
    if (typeof (object as { constructor?: unknown }).constructor !== "function" || _isPrototype(object)) {
        return {};
    }

    const proto: unknown = Object.getPrototypeOf(object);

    return _isObject(proto) ? Object.create(proto) : {};
}

/**
 * Initializes a clone of a value by its `toStringTag`. Collections come back empty and are filled by
 * the caller; everything else is complete on return.
 */
function _initCloneByTag(object: object, tag: string): _AnyRecord {
    const Ctor = (object as _Cloneable).constructor;

    switch (tag) {
        case ARRAY_BUFFER_TAG:
            return _cloneArrayBuffer(object as ArrayBuffer) as unknown as _AnyRecord;

        case BOOL_TAG:
        case DATE_TAG:
            return new Ctor(Number(object)) as _AnyRecord;

        case DATA_VIEW_TAG: {
            const view = object as DataView;

            return new Ctor(_cloneArrayBuffer(view.buffer), view.byteOffset, view.byteLength) as _AnyRecord;
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

    return _cloneTypedArray(object as ArrayBufferView & ArrayLike<unknown>) as unknown as _AnyRecord;
}

function _cloneArrayBuffer(arrayBuffer: ArrayBufferLike): ArrayBufferLike {
    const result = new (arrayBuffer as unknown as _Cloneable).constructor(
        arrayBuffer.byteLength,
    ) as ArrayBufferLike;

    new Uint8Array(result).set(new Uint8Array(arrayBuffer));

    return result;
}

/**
 * Clones a typed array of any class, keeping its view offset and length over a copy of the whole buffer.
 * A Node `Buffer` is copied through `Buffer.from`, since constructing one directly is deprecated.
 */
function _cloneTypedArray(typedArray: ArrayBufferView & ArrayLike<unknown>): ArrayBufferView {
    if (NodeBuffer?.isBuffer(typedArray)) {
        return NodeBuffer.from(typedArray as Uint8Array);
    }

    const Ctor = (typedArray as unknown as _Cloneable).constructor;

    return new Ctor(
        _cloneArrayBuffer(typedArray.buffer),
        typedArray.byteOffset,
        typedArray.length,
    ) as ArrayBufferView;
}
