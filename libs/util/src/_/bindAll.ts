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

import { _baseAssignValue } from "./_baseAssignValue.js";
import { _toKey } from "./_toKey.js";
import { _isArguments } from "./isArguments.js";
import type { _Many } from "./types.js";

type _AnyRecord = Record<PropertyKey, unknown>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any -- any arguments, as in lodash
type _AnyFunction = (...args: any[]) => any;

/**
 * Whether lodash's one-level flatten spreads `value`: arrays, arguments objects and anything marked with
 * `Symbol.isConcatSpreadable`.
 */
function isSpreadable(value: unknown): value is ArrayLike<unknown> {
    if (Array.isArray(value) || _isArguments(value)) {
        return true;
    }

    const spreadable = (value as { [Symbol.isConcatSpreadable]?: unknown } | null | undefined)?.[
        Symbol.isConcatSpreadable
    ];

    return Boolean(spreadable);
}

/**
 * Creates a function that invokes `func` with the `this` binding of `thisArg`. As in lodash, the created
 * function reports a length of `0`, and a `new` call constructs `func` itself, ignoring the binding.
 */
function bindTo(func: unknown, thisArg: object): _AnyFunction {
    if (typeof func !== "function") {
        throw new TypeError("Expected a function");
    }

    const target = func as _AnyFunction;

    return function (this: unknown, ...args: unknown[]) {
        return new.target ? Reflect.construct(target, args) : target.apply(thisArg, args);
    };
}

/**
 * Binds methods of an object to the object itself, overwriting the existing method. Method names may be
 * specified as individual arguments or as arrays of method names, which are flattened one level; names are
 * coerced to property keys the way lodash does it, so symbols and `-0` are kept.
 *
 * **Note:** This method doesn't set the "length" property of bound functions, and it mutates `object`.
 *
 * @param object - The object to bind and assign the bound methods to.
 * @param methodNames - The object method names to bind.
 * @returns Returns `object`.
 * @throws TypeError when a named property is not a function.
 * @internal
 */
export function _bindAll<T>(object: T, ...methodNames: _Many<string>[]): T {
    const target = object as unknown as _AnyRecord;
    const names: unknown[] = [];

    for (const entry of methodNames) {
        if (isSpreadable(entry)) {
            names.push(...Array.from(entry));
        } else {
            names.push(entry);
        }
    }

    for (const name of names) {
        const key = _toKey(name);

        _baseAssignValue(target, key, bindTo(target[key], target));
    }

    return object;
}
