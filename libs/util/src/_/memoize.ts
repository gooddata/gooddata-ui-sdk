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
 * The cache a memoized function keeps its results in. Keys are compared by SameValueZero, as a `Map`
 * does, so `NaN` equals `NaN` and objects compare by reference.
 *
 * @internal
 */
export type _MapCache = {
    /** Removes `key` and its value from the cache; returns whether the entry was removed. */
    delete(key: unknown): boolean;
    /** Gets the cached value for `key`. */
    get(key: unknown): unknown;
    /** Checks if a cached value for `key` exists. */
    has(key: unknown): boolean;
    /** Sets `value` to `key` of the cache; a cache that returns itself here lets `set` be chained. */
    set(key: unknown, value: unknown): unknown;
    /** Removes all entries from the cache. */
    clear?: (() => void) | undefined;
};

/**
 * @internal
 */
export type _MapCacheConstructor = new () => _MapCache;

/**
 * What `_memoize` adds to the function it returns.
 *
 * @internal
 */
export type _MemoizedFunction = {
    /** The cache of results, exposed so callers can inspect or edit it. */
    cache: _MapCache;
};

/**
 * The shape of `_memoize`: the memoizing function itself plus the `Cache` constructor every memoized
 * function starts with.
 *
 * @internal
 */
export type _Memoize = {
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    <T extends (...args: any) => any>(
        func: T,
        resolver?: (this: ThisParameterType<T>, ...args: Parameters<T>) => unknown,
    ): T & _MemoizedFunction;
    /** The constructor of the cache every memoized function starts with; a native `Map` unless replaced. */
    Cache: _MapCacheConstructor;
};

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is provided, it determines the
 * cache key for storing the result based on the arguments provided to the memoized function. By
 * default, the first argument provided to the memoized function is used as the map cache key. The
 * `func` is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized function. Its creation may be
 * customized by replacing the `_memoize.Cache` constructor with one whose instances implement the
 * `Map` method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @param func - The function to have its output memoized.
 * @param resolver - The function to resolve the cache key.
 * @returns Returns the new memoized function.
 * @internal
 */
export const _memoize: _Memoize = Object.assign(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    function memoize<T extends (...args: any) => any>(
        func: T,
        resolver?: (this: ThisParameterType<T>, ...args: Parameters<T>) => unknown,
    ): T & _MemoizedFunction {
        if (typeof func !== "function" || (resolver != null && typeof resolver !== "function")) {
            throw new TypeError("Expected a function");
        }

        const memoized = function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
            const key = resolver ? resolver.apply(this, args) : args[0];
            const cache = memoized.cache;

            if (cache.has(key)) {
                return cache.get(key) as ReturnType<T>;
            }

            const result = func.apply(this, args) as ReturnType<T>;

            // a cache whose `set` does not return itself keeps the existing instance
            memoized.cache = (cache.set(key, result) as _MapCache | undefined) || cache;

            return result;
        };

        memoized.cache = new _memoize.Cache();

        return memoized as unknown as T & _MemoizedFunction;
    },
    { Cache: Map as _MapCacheConstructor },
);
