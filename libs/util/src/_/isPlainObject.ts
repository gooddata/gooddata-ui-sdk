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
import { _isObjectLike } from "./isObjectLike.js";

/** `Object#toString` result references. */
const OBJECT_TAG = "[object Object]";

/** Used to infer the `Object` constructor. */
const OBJECT_CTOR_STRING = Function.prototype.toString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the `Object` constructor or one
 * with a `[[Prototype]]` of `null`.
 *
 * @param value - The value to check.
 * @returns Returns `true` if `value` is a plain object, else `false`.
 * @internal
 */
export function _isPlainObject(value?: unknown): boolean {
    if (!_isObjectLike(value) || _baseGetTag(value) !== OBJECT_TAG) {
        return false;
    }

    const proto: unknown = Object.getPrototypeOf(value);

    if (proto === null) {
        return true;
    }

    const Ctor =
        Object.hasOwn(proto as object, "constructor") && (proto as { constructor: unknown }).constructor;

    return (
        typeof Ctor === "function" &&
        Ctor instanceof Ctor &&
        Function.prototype.toString.call(Ctor) === OBJECT_CTOR_STRING
    );
}
