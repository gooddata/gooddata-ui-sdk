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
import { _baseSet } from "./_baseSet.js";
import { _castPath } from "./_castPath.js";
import { _hasPath } from "./_hasPath.js";
import type { _PropertyPath } from "./set.js";
import type { _Many, _PartialObject } from "./types.js";

/**
 * Creates an object composed of the picked `object` properties, own or inherited. Paths may be given
 * individually or in arrays and may be deep; a deep path recreates the containers along it in the result,
 * while the picked value itself is kept by reference.
 *
 * @param object - The source object.
 * @param props - The property paths to pick, given individually or in arrays.
 * @returns Returns the new object.
 * @internal
 */
export function _pick<T extends object, U extends keyof T>(object: T, ...props: _Many<U>[]): Pick<T, U>;
/**
 * @internal
 */
export function _pick<T>(object: T | null | undefined, ...props: _Many<_PropertyPath>[]): _PartialObject<T>;
export function _pick(object: unknown, ...props: unknown[]): object {
    const result = {};

    if (object == null) {
        return result;
    }

    for (const path of props.flat()) {
        const keys = _castPath(path, object as object);

        if (_hasPath(object, keys, (target, key) => key in target)) {
            _baseSet(result, keys, _baseGet(object, keys));
        }
    }

    return result;
}
