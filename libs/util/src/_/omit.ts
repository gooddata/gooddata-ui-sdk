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
import { _baseUnset } from "./_baseUnset.js";
import { _castPath } from "./_castPath.js";
import { _getAllKeysIn } from "./_getAllKeysIn.js";
import { _isPlainObject } from "./isPlainObject.js";
import type { _Many, _PropertyName } from "./types.js";

/**
 * @internal
 */
export type _PartialObject<T> = Partial<T>;

type _AnyRecord = Record<PropertyKey, unknown>;

/**
 * The opposite of `pick`; this method creates an object composed of the own and inherited enumerable
 * property paths of `object` that are not omitted.
 *
 * The result is always a new plain object. When any path is deep, every plain object reachable from
 * the result is copied first so the source is left untouched; non-plain values such as arrays, class
 * instances and dates are kept by reference and are therefore mutated by a deep path through them,
 * exactly as lodash does.
 *
 * @param object - The source object.
 * @param paths - The property paths to omit, given individually or in arrays.
 * @returns Returns the new object.
 * @internal
 */
export function _omit<T extends object, K extends _PropertyName[]>(
    object: T | null | undefined,
    ...paths: K
): Pick<T, Exclude<keyof T, K[number]>>;
/**
 * @see _omit
 * @internal
 */
export function _omit<T extends object, K extends keyof T>(
    object: T | null | undefined,
    ...paths: Array<_Many<K>>
): Omit<T, K>;
/**
 * @see _omit
 * @internal
 */
export function _omit<T extends object>(
    object: T | null | undefined,
    ...paths: Array<_Many<_PropertyName>>
): _PartialObject<T>;
export function _omit(object: unknown, ...paths: unknown[]): object {
    let result: _AnyRecord = {};

    if (object == null) {
        return result;
    }

    // paths may be given individually or in arrays; one level of arrays is flattened, as lodash does
    const castPaths = paths.flat().map((path) => _castPath(path, object as object));
    const isDeep = castPaths.some((path) => path.length > 1);
    const source = object as _AnyRecord;

    for (const key of _getAllKeysIn(source)) {
        _assignValue(result, key, source[key]);
    }

    if (isDeep) {
        result = _clonePlainObjects(result) as _AnyRecord;
    }

    for (let index = castPaths.length - 1; index >= 0; index--) {
        _baseUnset(result, castPaths[index]);
    }

    return result;
}

/**
 * Deep-copies the plain objects of `value` into new plain objects holding their own and inherited
 * enumerable properties; anything that is not a plain object is kept by reference. Cycles are preserved.
 */
function _clonePlainObjects(value: unknown, stack: Map<object, object> = new Map()): unknown {
    if (!_isPlainObject(value)) {
        return value;
    }

    const stacked = stack.get(value as object);

    if (stacked) {
        return stacked;
    }

    const source = value as _AnyRecord;
    const result: _AnyRecord = {};

    stack.set(source, result);

    for (const key of _getAllKeysIn(source)) {
        _assignValue(result, key, _clonePlainObjects(source[key], stack));
    }

    return result;
}
