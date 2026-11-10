// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _partial } from "./partial.js";

function greet(greeting: string, name: string): string {
    return `${greeting} ${name}`;
}

function join(...args: unknown[]): string {
    return args.map(String).join(",");
}

function self(this: unknown): unknown {
    return this;
}

class Point {
    constructor(
        public x: number,
        public y: number,
    ) {}

    public sum(): number {
        return this.x + this.y;
    }
}

const placeholder = _partial.placeholder;

// the lodash overloads cover up to four partials of fixed-arity functions; the runtime cases beyond that use this view
const partialAny = _partial as unknown as (
    func: (...args: never[]) => unknown,
    ...partials: unknown[]
) => (...args: unknown[]) => unknown;

// Expected values match lodash-es@4.18.1 `partial`.
describe("partial", () => {
    describe("arguments", () => {
        it("prepends the partial arguments to the call arguments", () => {
            expect(_partial(greet, "hello")("fred")).toBe("hello fred");
            expect(_partial(join, 1, 2)(3, 4)).toBe("1,2,3,4");
            expect(_partial(join, 1, 2)()).toBe("1,2");
            expect(_partial(join)(1, 2)).toBe("1,2");
        });

        it("keeps undefined and null partials as arguments", () => {
            expect(_partial(join, undefined, 2)(3)).toBe("undefined,2,3");
            expect(_partial(join, null)(1)).toBe("null,1");
        });

        it("accepts many partials", () => {
            expect(partialAny(join, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)(11, 12)).toBe(
                "1,2,3,4,5,6,7,8,9,10,11,12",
            );
        });

        it("returns a new function each time and leaves the original untouched", () => {
            expect(_partial(join, 1)).not.toBe(_partial(join, 1));
            expect(greet.length).toBe(2);
        });
    });

    describe("placeholders", () => {
        it("fills placeholders from the call arguments in order and appends the rest", () => {
            expect(_partial(greet, placeholder, "fred")("hi")).toBe("hi fred");
            expect(partialAny(join, placeholder, 2, placeholder, 4)(1, 3, 5)).toBe("1,2,3,4,5");
            expect(_partial(join, 1, placeholder)(2, 3)).toBe("1,2,3");
            expect(_partial(join, placeholder)(1, 2)).toBe("1,2");
        });

        it("leaves an unfilled placeholder as undefined", () => {
            expect(partialAny(join, placeholder, 2)()).toBe(",2".replace(",", "undefined,"));
            expect(partialAny(join, placeholder, placeholder, 3)(1)).toBe("1,undefined,3");
        });

        it("treats any other object, even an empty one, as an ordinary argument", () => {
            expect(_partial(join, {}, 2)(3)).toBe("[object Object],2,3");
        });

        it("exposes the placeholder as a stable plain empty object", () => {
            expect(_partial.placeholder).toBe(placeholder);
            expect(Object.keys(placeholder)).toEqual([]);
            expect(Object.getPrototypeOf(placeholder)).toBe(Object.prototype);
        });
    });

    describe("this binding", () => {
        it("passes the this of the call through instead of binding it", () => {
            const object = { f: _partial(self) };
            const method = {
                v: 7,
                m: _partial(function (this: { v: number }, a: string, b: string) {
                    return [this.v, a, b];
                }, "a"),
            };

            expect(object.f()).toBe(object);
            expect(_partial(self)()).toBeUndefined();
            expect(method.m("b")).toEqual([7, "a", "b"]);
        });

        it("keeps a bound function bound", () => {
            const bound = function (this: { v: number }, a: string): [number, string] {
                return [this.v, a];
            }.bind({ v: 1 });

            expect(partialAny(bound, "a")()).toEqual([1, "a"]);
        });
    });

    describe("constructors", () => {
        it("constructs an instance of the original function when called with new", () => {
            const PartialPoint = _partial(Point as unknown as (x: number, y: number) => Point, 1);
            const point = new (PartialPoint as unknown as new (y: number) => Point)(2);

            expect(point).toBeInstanceOf(Point);
            expect([point.x, point.y, point.sum()]).toEqual([1, 2, 3]);
        });

        it("fills placeholders when constructing too", () => {
            const PartialPoint = _partial(
                Point as unknown as (x: number, y: number) => Point,
                placeholder,
                5,
            );
            const point = new (PartialPoint as unknown as new (x: number) => Point)(3);

            expect(point).toBeInstanceOf(Point);
            expect([point.x, point.y]).toEqual([3, 5]);
        });

        it("returns the object a constructor returns explicitly", () => {
            function Custom(): { custom: boolean } {
                return { custom: true };
            }

            const instance = new (_partial(Custom) as unknown as new () => { custom: boolean })();

            expect(instance.custom).toBe(true);
        });
    });

    describe("nesting", () => {
        it("applies nested partials from the outermost call inwards", () => {
            expect(_partial(_partial(join, 1), 2)(3)).toBe("1,2,3");
            expect(_partial(_partial(_partial(join, 1), 2), 3)(4)).toBe("1,2,3,4");
            expect(partialAny(_partial(join, placeholder, 2), 1)(3)).toBe("1,2,3");
            expect(_partial(_partial(join, 1), placeholder, 3)(2)).toBe("1,2,3");
        });
    });

    describe("wrapper", () => {
        it("has no declared parameters and is named wrapper", () => {
            const wrapped = _partial(join, 1);

            expect(wrapped.length).toBe(0);
            expect(wrapped.name).toBe("wrapper");
        });

        it("throws for a non-function", () => {
            expect(() => _partial("nope" as unknown as () => void, 1)).toThrow(TypeError);
            expect(() => _partial("nope" as unknown as () => void, 1)).toThrow("Expected a function");
            expect(() => _partial(undefined as unknown as () => void)).toThrow(TypeError);
        });
    });

    describe("typing", () => {
        it("drops the applied parameters and keeps the rest", () => {
            const sayHelloTo: (name: string) => string = _partial(greet, "hello");
            const greetFred: (greeting: string) => string = _partial(greet, placeholder, "fred");
            const multiply: (b: number) => number = _partial((a: number, b: number) => a * b, 3);

            expect(sayHelloTo("fred")).toBe("hello fred");
            expect(greetFred("hi")).toBe("hi fred");
            expect(multiply(4)).toBe(12);
        });
    });
});
