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

import { _isObject } from "./isObject.js";

/**
 * Options for `_debounce`.
 *
 * @internal
 */
export type _DebounceSettings = {
    /** Invoke on the leading edge of the timeout. */
    leading?: boolean | undefined;
    /** The maximum time the function is allowed to be delayed before it is invoked. */
    maxWait?: number | undefined;
    /** Invoke on the trailing edge of the timeout. Defaults to `true`. */
    trailing?: boolean | undefined;
};

/**
 * {@link _DebounceSettings} with `leading` switched on, which guarantees a result on every call.
 *
 * @internal
 */
export type _DebounceSettingsLeading = _DebounceSettings & {
    leading: true;
};

/**
 * A debounced function: calling it applies the debounce rules and returns the result of the last
 * invocation, or `undefined` before the first one.
 *
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export type _DebouncedFunc<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): ReturnType<T> | undefined;
    /** Throws away any pending invocation. */
    cancel(): void;
    /** Invokes a pending invocation immediately and returns its result, else returns the last result. */
    flush(): ReturnType<T> | undefined;
};

/**
 * A debounced function created with `leading: true`, so a call always has a result.
 *
 * @internal
 */
// the narrower signatures come first so they win overload resolution, as they do when an interface extends
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export type _DebouncedFuncLeading<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): ReturnType<T>;
    flush(): ReturnType<T>;
} & _DebouncedFunc<T>;

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed
 * since the last time the debounced function was invoked. The debounced function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to immediately invoke them. Provide
 * `options` to indicate whether `func` should be invoked on the leading and/or trailing edge of the
 * `wait` timeout. The `func` is invoked with the last arguments provided to the debounced function.
 * Subsequent calls to the debounced function return the result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked on the trailing edge of
 * the timeout only if the debounced function is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred until the next tick, similar
 * to `setTimeout` with a timeout of `0`.
 *
 * @param func - The function to debounce.
 * @param wait - The number of milliseconds to delay.
 * @param options - The options object.
 * @returns Returns the new debounced function.
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function _debounce<T extends (...args: any) => any>(
    func: T,
    wait: number | undefined,
    options: _DebounceSettingsLeading,
): _DebouncedFuncLeading<T>;
/**
 * @see _debounce
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function _debounce<T extends (...args: any) => any>(
    func: T,
    wait?: number,
    options?: _DebounceSettings,
): _DebouncedFunc<T>;
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function _debounce<T extends (...args: any) => any>(
    func: T,
    wait?: number,
    options?: _DebounceSettings,
): _DebouncedFunc<T> {
    if (typeof func !== "function") {
        throw new TypeError("Expected a function");
    }

    const delay = Number(wait) || 0;
    const settings = _isObject(options) ? options : {};
    const leading = !!settings.leading;
    const maxing = "maxWait" in settings;
    const maxWait = maxing ? Math.max(Number(settings.maxWait) || 0, delay) : 0;
    const trailing = "trailing" in settings ? !!settings.trailing : true;

    let lastArgs: Parameters<T> | undefined;
    let lastThis: unknown;
    let lastCallTime: number | undefined;
    let lastInvokeTime = 0;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let result: ReturnType<T> | undefined;

    function invokeFunc(time: number): ReturnType<T> {
        const args = lastArgs as Parameters<T>;
        const thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;

        const value = func.apply(thisArg, args) as ReturnType<T>;

        result = value;

        return value;
    }

    function leadingEdge(time: number): ReturnType<T> | undefined {
        // reset any `maxWait` timer and start the timer for the trailing edge
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, delay);

        return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time: number): number {
        const timeSinceLastCall = time - (lastCallTime as number);
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = delay - timeSinceLastCall;

        return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    }

    function shouldInvoke(time: number): boolean {
        if (lastCallTime === undefined) {
            return true;
        }

        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;

        // activity has stopped and this is the trailing edge, the system clock went backwards, or the
        // `maxWait` limit was hit
        return (
            timeSinceLastCall >= delay || timeSinceLastCall < 0 || (maxing && timeSinceLastInvoke >= maxWait)
        );
    }

    function timerExpired(): void {
        const time = Date.now();

        if (shouldInvoke(time)) {
            trailingEdge(time);

            return;
        }

        // restart the timer for what is left of the wait
        timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time: number): ReturnType<T> | undefined {
        timerId = undefined;

        // only invoke if there are `lastArgs`, which means `func` has been debounced at least once
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }

        lastArgs = lastThis = undefined;

        return result;
    }

    function cancel(): void {
        if (timerId !== undefined) {
            clearTimeout(timerId);
        }

        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush(): ReturnType<T> | undefined {
        return timerId === undefined ? result : trailingEdge(Date.now());
    }

    function debounced(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);

        lastArgs = args;
        // the `this` of the latest call has to be kept for the deferred invocation
        // oxlint-disable-next-line @typescript-eslint/no-this-alias
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
            if (timerId === undefined) {
                return leadingEdge(lastCallTime);
            }

            if (maxing) {
                // handle invocations in a tight loop
                clearTimeout(timerId);
                timerId = setTimeout(timerExpired, delay);

                return invokeFunc(lastCallTime);
            }
        }

        if (timerId === undefined) {
            timerId = setTimeout(timerExpired, delay);
        }

        return result;
    }

    debounced.cancel = cancel;
    debounced.flush = flush;

    return debounced;
}
