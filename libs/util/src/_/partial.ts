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

import type { _Function1, _Function2, _Function3, _Function4 } from "./types.js";

declare const placeholderBrand: unique symbol;

/**
 * The type of `_partial.placeholder`, which stands in for lodash's `_` placeholder.
 *
 * @internal
 */
export type _Placeholder = { readonly [placeholderBrand]: true };

/**
 * The call signatures of `_partial`: each applied parameter is dropped from the resulting function, a
 * placeholder keeps its parameter in place.
 *
 * @internal
 */
export type _Partial = {
    <T1, T2, R>(func: _Function2<T1, T2, R>, plc1: _Placeholder, arg2: T2): _Function1<T1, R>;
    <T1, T2, T3, R>(func: _Function3<T1, T2, T3, R>, plc1: _Placeholder, arg2: T2): _Function2<T1, T3, R>;
    <T1, T2, T3, R>(
        func: _Function3<T1, T2, T3, R>,
        plc1: _Placeholder,
        plc2: _Placeholder,
        arg3: T3,
    ): _Function2<T1, T2, R>;
    <T1, T2, T3, R>(
        func: _Function3<T1, T2, T3, R>,
        arg1: T1,
        plc2: _Placeholder,
        arg3: T3,
    ): _Function1<T2, R>;
    <T1, T2, T3, R>(
        func: _Function3<T1, T2, T3, R>,
        plc1: _Placeholder,
        arg2: T2,
        arg3: T3,
    ): _Function1<T1, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        plc1: _Placeholder,
        arg2: T2,
    ): _Function3<T1, T3, T4, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        plc1: _Placeholder,
        plc2: _Placeholder,
        arg3: T3,
    ): _Function3<T1, T2, T4, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        arg1: T1,
        plc2: _Placeholder,
        arg3: T3,
    ): _Function2<T2, T4, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        plc1: _Placeholder,
        arg2: T2,
        arg3: T3,
    ): _Function2<T1, T4, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        plc1: _Placeholder,
        plc2: _Placeholder,
        plc3: _Placeholder,
        arg4: T4,
    ): _Function3<T1, T2, T3, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        arg1: T1,
        plc2: _Placeholder,
        plc3: _Placeholder,
        arg4: T4,
    ): _Function2<T2, T3, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        plc1: _Placeholder,
        arg2: T2,
        plc3: _Placeholder,
        arg4: T4,
    ): _Function2<T1, T3, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        arg1: T1,
        arg2: T2,
        plc3: _Placeholder,
        arg4: T4,
    ): _Function1<T3, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        plc1: _Placeholder,
        plc2: _Placeholder,
        arg3: T3,
        arg4: T4,
    ): _Function2<T1, T2, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        arg1: T1,
        plc2: _Placeholder,
        arg3: T3,
        arg4: T4,
    ): _Function1<T2, R>;
    <T1, T2, T3, T4, R>(
        func: _Function4<T1, T2, T3, T4, R>,
        plc1: _Placeholder,
        arg2: T2,
        arg3: T3,
        arg4: T4,
    ): _Function1<T1, R>;
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash signatures
    <TS extends any[], R>(func: (...ts: TS) => R): (...ts: TS) => R;
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash signatures
    <TS extends any[], T1, R>(func: (t1: T1, ...ts: TS) => R, arg1: T1): (...ts: TS) => R;
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash signatures
    <TS extends any[], T1, T2, R>(func: (t1: T1, t2: T2, ...ts: TS) => R, t1: T1, t2: T2): (...ts: TS) => R;
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash signatures
    <TS extends any[], T1, T2, T3, R>(
        func: (t1: T1, t2: T2, t3: T3, ...ts: TS) => R,
        t1: T1,
        t2: T2,
        t3: T3,
    ): (...ts: TS) => R;
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- matches the lodash signatures
    <TS extends any[], T1, T2, T3, T4, R>(
        func: (t1: T1, t2: T2, t3: T3, t4: T4, ...ts: TS) => R,
        t1: T1,
        t2: T2,
        t3: T3,
        t4: T4,
    ): (...ts: TS) => R;
    /** Marks a parameter of the function that is left open; `_partial.placeholder` is its only value. */
    placeholder: _Placeholder;
};

type _AnyFunction = (...args: unknown[]) => unknown;

/**
 * Creates a function that invokes `func` with `partials` prepended to the arguments it receives. This method
 * is like `bind` except it does **not** alter the `this` binding. The `_partial.placeholder` value may be
 * used as a placeholder for partially applied arguments: each placeholder takes the next argument of the
 * call, the remaining call arguments are appended. Calling the result with `new` constructs `func`.
 *
 * **Note:** This method doesn't set the "length" property of partially applied functions.
 *
 * @param func - The function to partially apply arguments to.
 * @param partials - The arguments to be partially applied.
 * @returns Returns the new partially applied function.
 * @internal
 */
export const _partial: _Partial = Object.assign(
    function partial(func: _AnyFunction, ...partials: unknown[]): _AnyFunction {
        if (typeof func !== "function") {
            throw new TypeError("Expected a function");
        }

        // placeholders are resolved when the function is created, as lodash does
        const holders = partials.map((value) => value === _partial.placeholder);

        return function wrapper(this: unknown, ...args: unknown[]): unknown {
            let index = 0;
            const composed = partials.map((value, position) => (holders[position] ? args[index++] : value));

            composed.push(...args.slice(index));

            if (new.target) {
                return Reflect.construct(func as unknown as new (...args: unknown[]) => object, composed);
            }

            return func.apply(this, composed);
        };
    } as unknown as _Partial,
    { placeholder: {} as _Placeholder },
);
