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

import { type _DebouncedFunc, type _DebouncedFuncLeading, _debounce } from "./debounce.js";
import { _isObject } from "./isObject.js";

/**
 * Options of `_throttle`.
 *
 * @internal
 */
export type _ThrottleSettings = {
    /** Invoke on the leading edge of the timeout. Defaults to `true`. */
    leading?: boolean | undefined;
    /** Invoke on the trailing edge of the timeout. Defaults to `true`. */
    trailing?: boolean | undefined;
};

/**
 * {@link _ThrottleSettings} that keep `leading` switched on, which guarantees a result on every call.
 *
 * @internal
 */
export type _ThrottleSettingsLeading =
    | (_ThrottleSettings & { leading: true })
    | Omit<_ThrottleSettings, "leading">;

/**
 * Creates a throttled function that only invokes `func` at most once per every `wait` milliseconds. The
 * throttled function comes with a `cancel` method to cancel delayed `func` invocations and a `flush` method
 * to immediately invoke them. Provide `options` to indicate whether `func` should be invoked on the leading
 * and/or trailing edge of the `wait` timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked on the trailing edge of the
 * timeout only if the throttled function is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred until the next tick, similar to
 * `setTimeout` with a timeout of `0`.
 *
 * @param func - The function to throttle.
 * @param wait - The number of milliseconds to throttle invocations to. Defaults to `0`.
 * @param options - The options object.
 * @returns Returns the new throttled function.
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function _throttle<T extends (...args: any) => any>(
    func: T,
    wait?: number,
    options?: _ThrottleSettingsLeading,
): _DebouncedFuncLeading<T>;
/**
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function _throttle<T extends (...args: any) => any>(
    func: T,
    wait?: number,
    options?: _ThrottleSettings,
): _DebouncedFunc<T>;
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function _throttle<T extends (...args: any) => any>(
    func: T,
    wait?: number,
    options?: _ThrottleSettings,
): _DebouncedFunc<T> {
    if (typeof func !== "function") {
        throw new TypeError("Expected a function");
    }

    const settings = _isObject(options) ? options : {};
    const leading = "leading" in settings ? !!settings.leading : true;
    const trailing = "trailing" in settings ? !!settings.trailing : true;

    // a throttle is a debounce whose maximum wait equals the wait, so the function is invoked at least once per
    // window while calls keep coming
    return _debounce(func, wait, { leading, maxWait: wait, trailing });
}
