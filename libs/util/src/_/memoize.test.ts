// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { _memoize } from "./memoize.js";

// Expected values match lodash-es@4.18.1 `memoize`.
describe("memoize", () => {
    const originalCache = _memoize.Cache;

    afterEach(() => {
        _memoize.Cache = originalCache;
    });

    describe("caching", () => {
        it("invokes the function once per distinct first argument and returns the cached result", () => {
            const fn = vi.fn((key: string, extra: string) => ({ key, extra }));
            const memoized = _memoize(fn);

            const first = memoized("a", "1");
            const second = memoized("a", "2");
            memoized("b", "3");

            expect(fn).toHaveBeenCalledTimes(2);
            expect(second).toBe(first);
            expect(second.extra).toBe("1");
        });

        it("keys the cache by the first argument only, ignoring the rest", () => {
            const fn = vi.fn((a: number, b: number) => a + b);
            const memoized = _memoize(fn);

            expect(memoized(1, 2)).toBe(3);
            expect(memoized(1, 100)).toBe(3);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it("tells keys of different types apart and uses SameValueZero for equality", () => {
            const fn = vi.fn((key: unknown) => ({ key }));
            const memoized = _memoize(fn);

            expect(memoized(1)).not.toBe(memoized("1"));
            expect(memoized(true)).not.toBe(memoized("true"));
            expect(memoized(null)).not.toBe(memoized("null"));
            expect(memoized(undefined)).not.toBe(memoized("undefined"));
            expect(memoized(0)).toBe(memoized(-0));
            expect(memoized(NaN)).toBe(memoized(NaN));
            expect(fn).toHaveBeenCalledTimes(10);
        });

        it("supports symbol, object and bigint keys", () => {
            const fn = vi.fn((_key: unknown) => ({}));
            const memoized = _memoize(fn);
            const sym = Symbol("s");
            const object = {};

            expect(memoized(sym)).toBe(memoized(sym));
            expect(memoized(object)).toBe(memoized(object));
            expect(memoized({})).not.toBe(memoized({}));
            expect(memoized(10n)).toBe(memoized(10n));
            expect(fn).toHaveBeenCalledTimes(5);
        });

        it("treats keys that collide with Object.prototype members as ordinary keys", () => {
            const fn = vi.fn((key: string) => key.length);
            const memoized = _memoize(fn);

            expect(memoized("__proto__")).toBe(9);
            expect(memoized("__proto__")).toBe(9);
            expect(memoized("constructor")).toBe(11);
            expect(memoized("hasOwnProperty")).toBe(14);
            expect(fn).toHaveBeenCalledTimes(3);
            expect(memoized.cache.has("__proto__")).toBe(true);
        });

        it("caches an undefined result", () => {
            const fn = vi.fn((_key: string) => undefined);
            const memoized = _memoize(fn);

            memoized("a");
            memoized("a");

            expect(fn).toHaveBeenCalledTimes(1);
            expect(memoized.cache.has("a")).toBe(true);
            expect(memoized.cache.get("a")).toBeUndefined();
        });
    });

    describe("resolver", () => {
        it("computes the cache key from all arguments", () => {
            const fn = vi.fn((a: number, b: number) => a + b);
            const memoized = _memoize(fn, (a, b) => `${a}|${b}`);

            expect(memoized(1, 2)).toBe(3);
            expect(memoized(1, 2)).toBe(3);
            expect(memoized(2, 1)).toBe(3);
            expect(fn).toHaveBeenCalledTimes(2);
            expect(memoized.cache.has("1|2")).toBe(true);
        });

        it("invokes both the resolver and the function with the this of the call", () => {
            const context = { tag: "ctx" };
            let resolverThis: unknown;
            const memoized = _memoize(
                function (this: unknown) {
                    return this;
                },
                function (this: unknown) {
                    // the test records which `this` the resolver was invoked with
                    // oxlint-disable-next-line @typescript-eslint/no-this-alias
                    resolverThis = this;

                    return "key";
                },
            );

            expect(memoized.call(context)).toBe(context);
            expect(resolverThis).toBe(context);
        });

        it("accepts a nullish resolver", () => {
            expect(() => _memoize((x: number) => x, null as unknown as undefined)).not.toThrow();
            expect(() => _memoize((x: number) => x, undefined)).not.toThrow();
        });
    });

    describe("cache property", () => {
        it("exposes the cache with has, get, set, delete, clear and size", () => {
            const memoized = _memoize((x: number) => x * 2);
            // `size` and `clear` are not part of the typed cache contract, but lodash's cache has both
            const cache = memoized.cache as unknown as Map<unknown, unknown>;

            memoized(2);

            expect(cache.has(2)).toBe(true);
            expect(cache.get(2)).toBe(4);
            expect(cache.has(3)).toBe(false);
            expect(cache.size).toBe(1);

            cache.set(2, 99);
            expect(memoized(2)).toBe(99);

            expect(cache.delete(2)).toBe(true);
            expect(cache.delete(42)).toBe(false);
            expect(memoized(2)).toBe(4);

            cache.clear();
            expect(cache.has(2)).toBe(false);
            expect(cache.size).toBe(0);
        });

        it("keeps the cache instance when its set method does not return the cache", () => {
            class SilentCache {
                private readonly map = new Map<unknown, unknown>();

                public has(key: unknown): boolean {
                    return this.map.has(key);
                }

                public get(key: unknown): unknown {
                    return this.map.get(key);
                }

                public set(key: unknown, value: unknown): undefined {
                    this.map.set(key, value);

                    return undefined;
                }

                public delete(key: unknown): boolean {
                    return this.map.delete(key);
                }
            }

            _memoize.Cache = SilentCache as unknown as typeof _memoize.Cache;
            const memoized = _memoize((x: number) => x);

            memoized(1);

            expect(memoized.cache).toBeInstanceOf(SilentCache);
            expect(memoized(1)).toBe(1);
        });
    });

    describe("memoize.Cache", () => {
        it("lets a different cache constructor be used for functions memoized afterwards", () => {
            _memoize.Cache = Map as unknown as typeof _memoize.Cache;
            const fn = vi.fn((x: number) => x + 1);
            const memoized = _memoize(fn);

            memoized(1);
            memoized(1);

            expect(memoized.cache).toBeInstanceOf(Map);
            expect(fn).toHaveBeenCalledTimes(1);
        });
    });

    describe("errors", () => {
        it("throws for a non-function", () => {
            expect(() => _memoize("x" as unknown as () => void)).toThrow(TypeError);
            expect(() => _memoize("x" as unknown as () => void)).toThrow("Expected a function");
        });

        it("throws for a non-function resolver", () => {
            expect(() => _memoize(() => 1, "x" as unknown as () => string)).toThrow(TypeError);
        });
    });

    describe("typing", () => {
        it("keeps the function signature and adds the cache", () => {
            const memoized = _memoize((a: number, b: string) => `${a}${b}`);
            const result: string = memoized(1, "x");

            expect(result).toBe("1x");
            expect(memoized.cache.has(1)).toBe(true);
        });
    });
});
