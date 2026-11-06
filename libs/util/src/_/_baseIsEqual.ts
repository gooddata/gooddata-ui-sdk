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
import { _getAllKeys } from "./_getAllKeys.js";
import { _eq } from "./eq.js";
import { _isObjectLike } from "./isObjectLike.js";
import { _isTypedArray } from "./isTypedArray.js";

/** `Object#toString` result references. */
const ARGS_TAG = "[object Arguments]";
const ARRAY_TAG = "[object Array]";
const OBJECT_TAG = "[object Object]";
const ARRAY_BUFFER_TAG = "[object ArrayBuffer]";
const BOOL_TAG = "[object Boolean]";
const DATA_VIEW_TAG = "[object DataView]";
const DATE_TAG = "[object Date]";
const ERROR_TAG = "[object Error]";
const MAP_TAG = "[object Map]";
const NUMBER_TAG = "[object Number]";
const REGEXP_TAG = "[object RegExp]";
const SET_TAG = "[object Set]";
const STRING_TAG = "[object String]";
const SYMBOL_TAG = "[object Symbol]";

/**
 * Tracks objects currently being compared, each mapped to its counterpart on the other side, so that
 * cyclic structures terminate: meeting an already-tracked pair again counts as equal.
 */
type _Stack = Map<object, object>;

/**
 * How two values are compared.
 *
 * `unordered` makes array elements match in any order; it is switched on for the contents of maps
 * and sets and, as in lodash, stays on for everything nested inside them.
 *
 * `partial` makes `value` a pattern that `other` only has to contain: arrays may be longer, objects
 * may have extra keys, inherited keys count, and constructors are not compared. It is what the
 * object and `[path, value]` iteratee shorthands use.
 *
 * @internal
 */
export type _CompareOptions = {
    unordered: boolean;
    partial: boolean;
};

const DEFAULT_OPTIONS: _CompareOptions = { unordered: false, partial: false };

/**
 * The base implementation of `_isEqual` which tracks traversed objects.
 *
 * @param value - The value to compare.
 * @param other - The other value to compare.
 * @param options - See {@link _CompareOptions}; both flags default to `false`.
 * @param stack - Tracks traversed `value` and `other` objects.
 * @returns Returns `true` if the values are equivalent, else `false`.
 * @internal
 */
export function _baseIsEqual(
    value: unknown,
    other: unknown,
    options: Partial<_CompareOptions> = DEFAULT_OPTIONS,
    stack: _Stack = new Map(),
): boolean {
    if (value === other) {
        return true;
    }

    if (value == null || other == null || (!_isObjectLike(value) && !_isObjectLike(other))) {
        // the only value that is not equal to itself is NaN, so this is `NaN` versus `NaN`
        return value !== value && other !== other;
    }

    const compare: _CompareOptions = { ...DEFAULT_OPTIONS, ...options };

    return _baseIsEqualDeep(value, other, compare, stack);
}

/**
 * Deep comparison of two non-primitive (or one boxed-primitive) values by their `toStringTag`.
 */
function _baseIsEqualDeep(object: unknown, other: unknown, options: _CompareOptions, stack: _Stack): boolean {
    const objIsArr = Array.isArray(object);
    const othIsArr = Array.isArray(other);
    let objTag = objIsArr ? ARRAY_TAG : _baseGetTag(object);
    let othTag = othIsArr ? ARRAY_TAG : _baseGetTag(other);

    // arguments objects are compared like plain objects
    objTag = objTag === ARGS_TAG ? OBJECT_TAG : objTag;
    othTag = othTag === ARGS_TAG ? OBJECT_TAG : othTag;

    const objIsObj = objTag === OBJECT_TAG;
    const othIsObj = othTag === OBJECT_TAG;
    const isSameTag = objTag === othTag;

    if (isSameTag && !objIsObj) {
        return objIsArr || _isTypedArray(object)
            ? _equalArrays(object as ArrayLike<unknown>, other as ArrayLike<unknown>, options, stack)
            : _equalByTag(object, other, objTag, options, stack);
    }

    // lodash chain wrappers are compared by the value they wrap; kept for parity with lodash
    if (!options.partial) {
        const objIsWrapped = objIsObj && Object.hasOwn(object as object, "__wrapped__");
        const othIsWrapped = othIsObj && Object.hasOwn(other as object, "__wrapped__");

        if (objIsWrapped || othIsWrapped) {
            const objUnwrapped = objIsWrapped ? (object as { value(): unknown }).value() : object;
            const othUnwrapped = othIsWrapped ? (other as { value(): unknown }).value() : other;

            return _baseIsEqual(objUnwrapped, othUnwrapped, options, stack);
        }
    }

    if (!isSameTag) {
        return false;
    }

    return _equalObjects(object as object, other as object, options, stack);
}

/**
 * Compares arrays and typed arrays element by element, or in any order when `unordered` is set.
 * A partial comparison lets `other` be longer than `array`.
 */
function _equalArrays(
    array: ArrayLike<unknown>,
    other: ArrayLike<unknown>,
    options: _CompareOptions,
    stack: _Stack,
): boolean {
    const length = array.length;

    if (length !== other.length && !(options.partial && other.length > length)) {
        return false;
    }

    const arrStacked = stack.get(array);
    const othStacked = stack.get(other);

    if (arrStacked && othStacked) {
        return arrStacked === other && othStacked === array;
    }

    stack.set(array, other);
    stack.set(other, array);

    // indices of `other` already matched to an element of `array`, only tracked for unordered comparison
    const seen = options.unordered ? new Set<number>() : undefined;
    let result = true;

    for (let index = 0; index < length; index++) {
        const arrValue = array[index];

        if (seen) {
            let matched = false;

            for (let othIndex = 0; othIndex < other.length; othIndex++) {
                const othValue = other[othIndex];

                if (
                    !seen.has(othIndex) &&
                    (arrValue === othValue || _baseIsEqual(arrValue, othValue, options, stack))
                ) {
                    seen.add(othIndex);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                result = false;
                break;
            }
        } else {
            const othValue = other[index];

            if (!(arrValue === othValue || _baseIsEqual(arrValue, othValue, options, stack))) {
                result = false;
                break;
            }
        }
    }

    stack.delete(array);
    stack.delete(other);

    return result;
}

/**
 * Compares two array buffers byte by byte.
 */
function _equalArrayBuffers(object: ArrayBufferLike, other: ArrayBufferLike): boolean {
    if (object.byteLength !== other.byteLength) {
        return false;
    }

    const objBytes = new Uint8Array(object);
    const othBytes = new Uint8Array(other);

    for (let index = 0; index < objBytes.length; index++) {
        if (objBytes[index] !== othBytes[index]) {
            return false;
        }
    }

    return true;
}

/**
 * Compares two values that share one of the supported `toStringTag`s. Any other tag is not comparable
 * and yields `false`, which covers weak collections, promises and host objects.
 */
function _equalByTag(
    object: unknown,
    other: unknown,
    tag: string,
    options: _CompareOptions,
    stack: _Stack,
): boolean {
    switch (tag) {
        case DATA_VIEW_TAG: {
            const objView = object as DataView;
            const othView = other as DataView;

            if (objView.byteLength !== othView.byteLength || objView.byteOffset !== othView.byteOffset) {
                return false;
            }

            return _equalArrayBuffers(objView.buffer, othView.buffer);
        }

        case ARRAY_BUFFER_TAG:
            return _equalArrayBuffers(object as ArrayBuffer, other as ArrayBuffer);

        case BOOL_TAG:
        case DATE_TAG:
        case NUMBER_TAG:
            // booleans become 1 or 0, dates their milliseconds, invalid dates NaN; `_eq` makes NaN equal NaN
            return _eq(Number(object), Number(other));

        case ERROR_TAG: {
            const objError = object as Error;
            const othError = other as Error;

            return objError.name === othError.name && objError.message === othError.message;
        }

        case REGEXP_TAG:
        case STRING_TAG:
            // regexes compare by their source and flags, strings by content whether boxed or primitive
            return String(object) === String(other);

        case MAP_TAG:
        case SET_TAG: {
            const objCollection = object as Map<unknown, unknown> | Set<unknown>;
            const othCollection = other as Map<unknown, unknown> | Set<unknown>;

            if (objCollection.size !== othCollection.size && !options.partial) {
                return false;
            }

            const stacked = stack.get(objCollection);

            if (stacked) {
                return stacked === othCollection;
            }

            stack.set(objCollection, othCollection);

            // entries (maps) or values (sets) are matched in any order
            const result = _equalArrays(
                [...objCollection],
                [...othCollection],
                { unordered: true, partial: options.partial },
                stack,
            );

            stack.delete(objCollection);

            return result;
        }

        case SYMBOL_TAG:
            return (object as symbol).valueOf() === (other as symbol).valueOf();
    }

    return false;
}

/**
 * Compares two plain objects by their own enumerable string and symbol keys, then by constructor.
 * A partial comparison only requires `other` to have every key of `object`, own or inherited, and
 * skips the constructor check.
 */
function _equalObjects(object: object, other: object, options: _CompareOptions, stack: _Stack): boolean {
    const objProps = _getAllKeys(object);
    const othProps = _getAllKeys(other);

    if (objProps.length !== othProps.length && !options.partial) {
        return false;
    }

    for (const key of objProps) {
        if (!(options.partial ? key in other : Object.hasOwn(other, key))) {
            return false;
        }
    }

    const objStacked = stack.get(object);
    const othStacked = stack.get(other);

    if (objStacked && othStacked) {
        return objStacked === other && othStacked === object;
    }

    stack.set(object, other);
    stack.set(other, object);

    const objRecord = object as Record<PropertyKey, unknown>;
    const othRecord = other as Record<PropertyKey, unknown>;
    let result = true;
    let skipCtor = options.partial;

    for (const key of objProps) {
        const objValue = objRecord[key];
        const othValue = othRecord[key];

        if (!(objValue === othValue || _baseIsEqual(objValue, othValue, options, stack))) {
            result = false;
            break;
        }

        skipCtor ||= key === "constructor";
    }

    if (result && !skipCtor) {
        const objCtor = (object as { constructor?: unknown }).constructor;
        const othCtor = (other as { constructor?: unknown }).constructor;

        // non-`Object` instances with different constructors are not equal
        if (
            objCtor !== othCtor &&
            "constructor" in object &&
            "constructor" in other &&
            !(
                typeof objCtor === "function" &&
                objCtor instanceof objCtor &&
                typeof othCtor === "function" &&
                othCtor instanceof othCtor
            )
        ) {
            result = false;
        }
    }

    stack.delete(object);
    stack.delete(other);

    return result;
}
