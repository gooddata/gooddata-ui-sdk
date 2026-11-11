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

import { _baseClone } from "./_baseClone.js";
import type { _CloneDeepWithCustomizer } from "./types.js";

/**
 * This method is like `_cloneDeep` except that it accepts `customizer` which is invoked to produce the
 * cloned value. If `customizer` returns `undefined`, cloning is handled by the method instead. The
 * `customizer` is invoked with up to four arguments: (value [, index|key, object, stack]). Anything but
 * a function is ignored as a customizer.
 *
 * @param value - The value to recursively clone.
 * @param customizer - The function to customize cloning.
 * @returns Returns the deep cloned value.
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash signature
export function _cloneDeepWith<T>(value: T, customizer: _CloneDeepWithCustomizer<T>): any;
/**
 * @internal
 */
export function _cloneDeepWith<T>(value: T): T;
export function _cloneDeepWith(value: unknown, customizer?: unknown): unknown {
    const customize =
        typeof customizer === "function" ? (customizer as _CloneDeepWithCustomizer<unknown>) : undefined;

    return _baseClone(value, true, customize);
}
