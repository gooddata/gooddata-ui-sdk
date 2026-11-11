// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _bindAll } from "./bindAll.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

interface IView {
    label: string;
    click(...rest: unknown[]): string;
    other(): string;
    notFn: number;
}

function makeView(): IView {
    return {
        label: "view",
        click(...rest: unknown[]) {
            const self = this as IView | undefined;

            return `${self === undefined ? "undefined" : self.label}:${rest.join(",")}`;
        },
        other() {
            const self = this as IView | undefined;

            return self === undefined ? "undefined" : self.label;
        },
        notFn: 1,
    };
}

// Expected values match lodash-es@4.18.1 `bindAll`.
describe("bindAll", () => {
    describe("binding", () => {
        it("binds the named methods to the object, so they keep this when detached", () => {
            const view = makeView();
            const result = _bindAll(view, "click");
            const detached = view.click;

            expect(result).toBe(view);
            expect(detached("a", 1)).toBe("view:a,1");
            expect(view.click.call({ label: "other" } as IView, "x")).toBe("view:x");
        });

        it("accepts several names, arrays of names and arguments objects, flattened one level", () => {
            const flat = makeView();
            const arrays = makeView();
            const mixed = makeView();
            const args = makeView();

            _bindAll(flat, "click", "other");
            _bindAll(arrays, ["click", "other"]);
            _bindAll(mixed, ["click"], "other");
            _bindAll(args, getArguments("click", "other") as unknown as string[]);

            for (const view of [flat, arrays, mixed, args]) {
                const { click, other } = view;

                expect(click("z")).toBe("view:z");
                expect(other()).toBe("view");
            }

            // deeper arrays are not flattened but coerced to a key, so a single nested name still works
            const nested = makeView();

            _bindAll(nested, [["click"]] as unknown as string[]);

            const nestedClick = nested.click;

            expect(nestedClick("n")).toBe("view:n");

            const joined = [["click", "other"]] as unknown as string[];

            expect(() => _bindAll(makeView(), joined)).toThrow(TypeError);
        });

        it("forwards every argument and keeps the bound function's length at 0", () => {
            const object = {
                method(...rest: unknown[]) {
                    return [this === object, rest];
                },
                three(a: number, b: number, c: number) {
                    return [a, b, c];
                },
            };

            _bindAll(object, "method", "three");

            const { method, three } = object;

            expect(method(1, 2, 3)).toEqual([true, [1, 2, 3]]);
            expect(method(1, 2, 3, 4, 5, 6)).toEqual([true, [1, 2, 3, 4, 5, 6]]);
            expect(three.length).toBe(0);
        });

        it("constructs the original function when a bound method is called with new", () => {
            function Point(this: { x: number }, x: number) {
                this.x = x;
            }

            Point.prototype.get = function (this: { x: number }) {
                return this.x;
            };

            function Custom() {
                return { custom: true };
            }

            const holder = { Point, Custom };

            _bindAll(holder, "Point", "Custom");

            const Bound = holder.Point as unknown as new (x: number) => { x: number; get(): number };
            const instance = new Bound(5);

            expect(instance).toBeInstanceOf(Point);
            expect(instance.get()).toBe(5);
            expect(new (holder.Custom as unknown as new () => object)()).toEqual({ custom: true });
        });

        it("binds inherited, class and async methods as own properties, but cannot replace a getter", () => {
            class Counter {
                value = 7;

                read() {
                    return this.value;
                }
            }

            let reads = 0;
            const counter = new Counter();
            const withGetter = {
                get method() {
                    reads++;

                    return function (this: unknown) {
                        return this === withGetter;
                    };
                },
            };
            const asyncHolder = {
                async load() {
                    return this === asyncHolder;
                },
            };

            _bindAll(counter, "read");
            _bindAll(asyncHolder, "load");

            const { read } = counter;
            const { load } = asyncHolder;

            expect(Object.hasOwn(counter, "read")).toBe(true);
            expect(read()).toBe(7);
            // the getter is read, but assigning the bound method to a getter-only property throws
            expect(() => _bindAll(withGetter, "method")).toThrow(TypeError);
            expect(reads).toBe(1);

            return load().then((bound) => expect(bound).toBe(true));
        });

        it("rebinds already bound methods and binds the same function on several keys", () => {
            const view = makeView();
            const shared = function (this: unknown) {
                return (this as { tag: string }).tag;
            };
            const pair = { tag: "pair", a: shared, b: shared };

            _bindAll(view, "click");
            _bindAll(view, "click");
            _bindAll(pair, "a", "b");

            const { click } = view;
            const { a, b } = pair;

            expect(click("r")).toBe("view:r");
            expect(a()).toBe("pair");
            expect(b()).toBe("pair");
            expect(pair.a).not.toBe(pair.b);
        });
    });

    describe("keys", () => {
        it("coerces names to keys the way lodash does, keeping symbols and -0", () => {
            const symbol = Symbol("s");
            const holder = {
                0() {
                    return this === holder ? "zero" : "lost";
                },
                "-0"() {
                    return this === holder ? "neg" : "lost";
                },
                1.5() {
                    return this === holder;
                },
                true() {
                    return this === holder;
                },
                "[object Object]"() {
                    return this === holder;
                },
                "a.b"() {
                    return this === holder;
                },
                [symbol]() {
                    return this === holder;
                },
            };

            _bindAll(holder, 0 as unknown as string, -0 as unknown as string, 1.5 as unknown as string);
            _bindAll(holder, true as unknown as string, {} as unknown as string, "a.b");
            _bindAll(holder, symbol as unknown as string);

            const zero = holder[0];
            const negativeZero = holder["-0"];
            const fraction = holder[1.5];
            const truthy = holder.true;
            const object = holder["[object Object]"];
            const dotted = holder["a.b"];
            const symbolic = holder[symbol];

            expect([zero(), negativeZero(), fraction(), truthy(), object(), dotted(), symbolic()]).toEqual([
                "zero",
                "neg",
                true,
                true,
                true,
                true,
                true,
            ]);
        });

        it("works on arrays, functions and strings-keyed array-like methods", () => {
            const array = [
                function (this: unknown) {
                    return this === array;
                },
            ];
            const fn = Object.assign(() => 1, {
                method(this: unknown) {
                    return this === fn;
                },
            });

            _bindAll(array, 0 as unknown as string);
            _bindAll(fn, "method");

            const [first] = array;
            const { method } = fn;

            expect(first?.()).toBe(true);
            expect(method()).toBe(true);
        });
    });

    describe("errors and edge cases", () => {
        it("throws a TypeError for names that are not functions, including __proto__", () => {
            expect(() => _bindAll(makeView(), "notFn")).toThrow(TypeError);
            expect(() => _bindAll(makeView(), "notFn")).toThrow("Expected a function");
            expect(() => _bindAll(makeView(), "missing")).toThrow(TypeError);
            expect(() => _bindAll({}, "__proto__")).toThrow(TypeError);
            expect(() => _bindAll({}, "constructor")).not.toThrow();
        });

        it("returns a nullish object untouched without names and throws with names", () => {
            expect(_bindAll(null)).toBeNull();
            expect(_bindAll(undefined)).toBeUndefined();
            expect(() => _bindAll(null, "a")).toThrow(TypeError);
            expect(() => _bindAll(undefined, "a")).toThrow(TypeError);
        });

        it("leaves the object alone without names or with an empty list", () => {
            const view = makeView();
            const before = view.click;

            expect(_bindAll(view)).toBe(view);
            expect(_bindAll(view, [])).toBe(view);
            expect(view.click).toBe(before);
        });

        it("throws on primitives, non-writable properties and frozen objects", () => {
            const nonWritable = {};
            const frozen = Object.freeze({
                method() {
                    return 1;
                },
            });

            Object.defineProperty(nonWritable, "method", {
                value: () => 1,
                writable: false,
                configurable: true,
            });

            expect(() => _bindAll(1, "toFixed")).toThrow(TypeError);
            expect(() => _bindAll("abc", "toUpperCase")).toThrow(TypeError);
            expect(() => _bindAll(nonWritable, "method")).toThrow(TypeError);
            expect(() => _bindAll(frozen, "method")).toThrow(TypeError);
        });
    });

    describe("typing", () => {
        it("returns the object type", () => {
            const view: IView = _bindAll(makeView(), "click", ["other"]);

            expect(view.label).toBe("view");
        });
    });
});
