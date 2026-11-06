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

/**
 * A specialized version of `_baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * The tag is temporarily masked on the value itself so that `Object#toString` reports the real class.
 * The original state is restored afterwards. Frozen objects and primitives reject the mask, in which case
 * the tag is read as-is.
 *
 * @param value - The value to query.
 * @returns Returns the raw `toStringTag`.
 * @internal
 */
export function _getRawTag(value: unknown): string {
    const target = value as { [Symbol.toStringTag]?: unknown };
    const isOwn = Object.hasOwn(Object(value) as object, Symbol.toStringTag);
    const tag = target[Symbol.toStringTag];

    let unmasked = false;

    try {
        target[Symbol.toStringTag] = undefined;
        unmasked = true;
    } catch {
        // frozen object or primitive: the tag cannot be masked, read it as-is
    }

    const result = Object.prototype.toString.call(value);

    if (unmasked) {
        if (isOwn) {
            target[Symbol.toStringTag] = tag;
        } else {
            delete target[Symbol.toStringTag];
        }
    }

    return result;
}
