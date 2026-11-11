// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _isError } from "./isError.js";

class CustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CustomError";
    }
}

class ErrorLike {
    message = "m";
    name = "n";
}

class MessageOnly {
    message = "m";
}

// Expected values match lodash-es@4.18.1 `isError`.
describe("isError", () => {
    describe("error objects", () => {
        it("recognises every built-in error type and subclasses", () => {
            expect(_isError(new Error("x"))).toBe(true);
            expect(_isError(new TypeError("x"))).toBe(true);
            expect(_isError(new RangeError())).toBe(true);
            expect(_isError(new SyntaxError())).toBe(true);
            expect(_isError(new ReferenceError())).toBe(true);
            expect(_isError(new EvalError())).toBe(true);
            expect(_isError(new URIError())).toBe(true);
            expect(_isError(new AggregateError([new Error("a")], "agg"))).toBe(true);
            expect(_isError(new CustomError("x"))).toBe(true);
            expect(_isError(new DOMException("x", "AbortError"))).toBe(true);
        });

        it("recognises errors regardless of their own properties", () => {
            const renamed = new Error("x");

            renamed.name = undefined as unknown as string;

            expect(_isError(renamed)).toBe(true);
            expect(_isError(Object.freeze(new Error("x")))).toBe(true);
            expect(_isError(Object.assign(new Error("x"), { [Symbol.toStringTag]: "Foo" }))).toBe(true);
            expect(_isError(new Proxy(new Error("x"), {}))).toBe(true);
        });

        it("ignores a faked toStringTag, because the raw tag is used", () => {
            expect(_isError({ [Symbol.toStringTag]: "Error" })).toBe(false);
            expect(_isError({ [Symbol.toStringTag]: "DOMException" })).toBe(false);
            expect(_isError({ [Symbol.toStringTag]: "Errors" })).toBe(false);
        });
    });

    describe("error-like objects", () => {
        it("recognises non-plain objects with string message and name", () => {
            expect(_isError(new ErrorLike())).toBe(true);
            expect(_isError(Object.freeze(new ErrorLike()))).toBe(true);
            expect(_isError(Object.create(Error.prototype))).toBe(true);
            expect(_isError(Object.create(new Error("x")))).toBe(true);
            expect(_isError(Object.create(Object.create(new Error("x"))))).toBe(true);
            expect(_isError(TypeError.prototype)).toBe(true);
            expect(
                _isError(
                    new (class {
                        get message(): string {
                            return "m";
                        }

                        get name(): string {
                            return "n";
                        }
                    })(),
                ),
            ).toBe(true);
        });

        it("rejects plain objects, even with string message and name", () => {
            expect(_isError({ message: "m", name: "n" })).toBe(false);
            expect(_isError({ message: "m", name: "n", stack: "s" })).toBe(false);
            expect(_isError(Object.assign(Object.create(null), { message: "m", name: "n" }))).toBe(false);
            expect(_isError(new Proxy({ message: "m", name: "n" }, {}))).toBe(false);
            expect(_isError(Error.prototype)).toBe(false);
        });

        it("rejects objects whose message or name is missing or not a string", () => {
            expect(_isError(new MessageOnly())).toBe(false);
            expect(_isError({ message: 1, name: "n" })).toBe(false);
            expect(
                _isError(
                    new (class {
                        message = "m";
                        name = 1;
                    })(),
                ),
            ).toBe(false);
        });
    });

    describe("other values", () => {
        it("rejects primitives, functions and other built-ins", () => {
            expect(_isError(null)).toBe(false);
            expect(_isError(undefined)).toBe(false);
            expect(_isError("Error")).toBe(false);
            expect(_isError(1)).toBe(false);
            expect(_isError(true)).toBe(false);
            expect(_isError(Symbol("e"))).toBe(false);
            expect(_isError(1n)).toBe(false);
            expect(_isError(() => 1)).toBe(false);
            expect(_isError(Error)).toBe(false);
            expect(_isError([])).toBe(false);
            expect(_isError(new Date())).toBe(false);
            expect(_isError(/x/)).toBe(false);
            expect(_isError(new Map())).toBe(false);
            expect(_isError(Promise.resolve())).toBe(false);
            expect(_isError(Object("x"))).toBe(false);
            expect((_isError as unknown as () => boolean)()).toBe(false);
        });

        it("ignores extra arguments", () => {
            expect((_isError as unknown as (a: unknown, b: number) => boolean)(new Error("x"), 1)).toBe(true);
            expect(_isError.length).toBe(1);
        });
    });

    describe("typing", () => {
        it("narrows to Error", () => {
            const value: unknown = new TypeError("x");

            if (_isError(value)) {
                const message: string = value.message;

                expect(message).toBe("x");
            }

            expect.assertions(1);
        });
    });
});
