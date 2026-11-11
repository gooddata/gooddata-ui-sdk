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
import type { _PropertyPath } from "./set.js";
import type { _SetWithCustomizer } from "./types.js";

/**
 * This method is like `_update` except that it accepts `customizer` which is invoked to produce the objects
 * of `path`. If `customizer` returns `undefined` path creation is handled by the method instead. The
 * `customizer` is invoked with three arguments: (nsValue, key, nsObject). Anything but a function is
 * ignored as a customizer, and anything but a function is the identity as an updater.
 *
 * **Note:** This method mutates `object`.
 *
 * @param object - The object to modify.
 * @param path - The path of the property to set.
 * @param updater - The function to produce the updated value.
 * @param customizer - The function to customize assigned values.
 * @returns Returns `object`.
 * @internal
 */
export function _updateWith<T extends object>(
    object: T,
    path: _PropertyPath,
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash signature
    updater: (oldValue: any) => any,
    customizer?: _SetWithCustomizer<T>,
): T;
/**
 * @internal
 */
export function _updateWith<T extends object, TResult>(
    object: T,
    path: _PropertyPath,
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash signature
    updater: (oldValue: any) => any,
    customizer?: _SetWithCustomizer<T>,
): TResult;
export function _updateWith(
    object: object,
    path: _PropertyPath,
    updater: unknown,
    customizer?: unknown,
): unknown {
    if (object == null) {
        return object;
    }

    const produce = typeof updater === "function" ? updater : (value: unknown) => value;
    const customize =
        typeof customizer === "function" ? (customizer as _SetWithCustomizer<unknown>) : undefined;

    return _baseSet(object, path, produce(_baseGet(object, path)), customize);
}
