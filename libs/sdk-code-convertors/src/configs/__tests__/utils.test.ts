// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ValueType, getValueOrDefault } from "../utils.js";

describe("getValueOrDefault", () => {
    const expectValue = (
        value: any,
        defaultValue: any,
        type: ValueType,
        undefinedAsDefault: boolean = false,
    ) => {
        return expect(getValueOrDefault(value, defaultValue, type, undefinedAsDefault));
    };

    it("should return undefined when value equals default (default-stripping behavior)", () => {
        // This is the core behavior: values equal to default are stripped (return undefined)
        expectValue("same", "same", "string").toBeUndefined();
        expectValue(true, true, "bool").toBeUndefined();
        expectValue(100, 100, "number").toBeUndefined();
    });

    it("should return the value when different from default", () => {
        expectValue("test", "default", "string").toBe("test");
        expectValue(true, false, "bool").toBe(true);
        expectValue(123, 0, "number").toBe(123);
    });

    it("should return undefined when value is undefined and undefinedAsDefault is false", () => {
        expectValue(undefined, "default", "string").toBeUndefined();
        expectValue(undefined, true, "bool").toBeUndefined();
        expectValue(undefined, 100, "number").toBeUndefined();
    });

    it("should return default when value is undefined and undefinedAsDefault is true", () => {
        // With undefinedAsDefault=true, undefined is substituted with defaultValue
        // and since original value (undefined) !== defaultValue, the result is emitted
        expectValue(undefined, "default", "string", true).toBe("default");
        expectValue(undefined, true, "bool", true).toBe(true);
        expectValue(undefined, 100, "number", true).toBe(100);
        expectValue(undefined, ["default"], "array", true).toEqual(["default"]);
    });

    describe("string type", () => {
        it("should convert non-string values to string", () => {
            expectValue(123, "0", "string").toBe("123");
            expectValue(true, "0", "string").toBe("true");
        });
    });

    describe("bool type", () => {
        it("should coerce truthy/falsy values", () => {
            expectValue(1, false, "bool").toBe(true);
            expectValue(0, true, "bool").toBe(false);
            expectValue("anything", false, "bool").toBe(true);
        });
    });

    describe("bool_auto type", () => {
        it("should pass through 'auto' as-is", () => {
            expectValue("auto", false, "bool_auto").toBe("auto");
        });

        it("should coerce non-auto values to boolean", () => {
            expectValue(true, false, "bool_auto").toBe(true);
            expectValue(0, true, "bool_auto").toBe(false);
        });
    });

    describe("number type", () => {
        it("should parse numeric strings", () => {
            expectValue("123", 0, "number").toBe(123);
            expectValue("123.45", 0, "number").toBe(123.45);
        });

        it("should return undefined for non-numeric strings", () => {
            expectValue("abc", 0, "number").toBeUndefined();
        });
    });

    describe("array type", () => {
        it("should pass through arrays", () => {
            expectValue(["a", "b"], [], "array").toEqual(["a", "b"]);
        });

        it("should wrap single values in array", () => {
            expectValue("test", [], "array").toEqual(["test"]);
            expectValue(123, [], "array").toEqual([123]);
        });

        it("should wrap null in array", () => {
            expectValue(null, ["default"], "array").toEqual([null]);
        });
    });
});
