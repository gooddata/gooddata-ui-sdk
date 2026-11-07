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

import { _isPrototype } from "./_isPrototype.js";

/**
 * Creates an array of the own and inherited enumerable property names and symbols of `object`.
 *
 * An inherited enumerable `constructor` key is skipped, as is one on a prototype object, since it
 * only exists because a prototype was replaced wholesale.
 *
 * @param object - The object to query.
 * @returns Returns the array of property names and symbols.
 * @internal
 */
export function _getAllKeysIn(object: object): (string | symbol)[] {
    const skipConstructor = _isPrototype(object) || !Object.hasOwn(object, "constructor");
    const keys: (string | symbol)[] = [];

    for (const key in object) {
        if (!(key === "constructor" && skipConstructor)) {
            keys.push(key);
        }
    }

    for (let current: object | null = object; current !== null; current = Object.getPrototypeOf(current)) {
        for (const symbol of Object.getOwnPropertySymbols(current)) {
            if (Object.prototype.propertyIsEnumerable.call(current, symbol)) {
                keys.push(symbol);
            }
        }
    }

    return keys;
}
