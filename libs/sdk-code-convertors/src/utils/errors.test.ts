// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { CoreErrorCode, buildMessage, newError, updateErrorContext } from "./errors.js";

describe("errors", () => {
    describe("updateErrorContext", () => {
        it("should create a new context if undefined", () => {
            const context = updateErrorContext(undefined, { type: "test", path: ["foo"] });
            expect(context).toEqual({
                type: "test",
                path: ["foo"],
                data: {},
            });
        });

        it("should update existing context", () => {
            const context = { type: "old", path: ["root"], data: { x: 1 } };
            const updated = updateErrorContext(context, { path: ["child"], data: { y: 2 } });
            expect(updated).toEqual({
                type: "old",
                path: ["root", "child"],
                data: { y: 2 },
            });
        });

        it("should use default type unknown if not provided and context is undefined", () => {
            const context = updateErrorContext(undefined, { path: ["foo"] });
            expect(context.type).toBe("unknown");
        });
    });

    describe("buildMessage", () => {
        it("should build message without context", () => {
            const msg = buildMessage("Error {0} at {1}", ["A", "B"]);
            expect(msg).toBe("Error A at B");
        });

        it("should build message with context path", () => {
            const msg = buildMessage("Error {0}", ["A"], { path: ["root", "child"] });
            expect(msg).toBe("Error A in: root/child");
        });

        it("should build message without context path even if context is provided", () => {
            const msg = buildMessage("Error {0}", ["A"], { type: "test" });
            expect(msg).toBe("Error A");
        });

        it("does not fill a placeholder written inside a parameter", () => {
            expect(buildMessage("{0} {1}", ["{1}", "x"])).toBe("{1} x");
        });

        it("keeps a replacement pattern in a parameter as written", () => {
            expect(buildMessage("{0}", ["$&"])).toBe("$&");
        });

        it("keeps a placeholder that has no parameter", () => {
            expect(buildMessage("{0} and {1}", ["A"], { path: ["a", "b"] })).toBe("A and {1} in: a/b");
        });
    });

    describe("newError", () => {
        it("should create a new error with code, type and context", () => {
            const context = { type: "test", path: ["foo"] };
            const err = newError(CoreErrorCode.BucketItemTypeNotSupported, ["item1"], context);
            expect(err.code).toBe(CoreErrorCode.BucketItemTypeNotSupported);
            expect(err.type).toBe("BucketItemTypeNotSupported");
            expect(err.context).toEqual(context);
            expect(err.message).toContain("Report item type is not supported. Item: item1");
            expect(err.message).toContain("in: foo");
        });
    });
});
