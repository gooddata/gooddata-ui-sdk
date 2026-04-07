// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ValueType, getValueOrDefault } from "../utils.js";

describe("getValueOrDefault", () => {
    const value = (value: any, defaultValue: any, type: ValueType, undefinedAsDefault: boolean = false) => {
        return getValueOrDefault(value, defaultValue, type, undefinedAsDefault);
    };

    it("should return undefined when value equals default (default-stripping behavior)", () => {
        // This is the core behavior: values equal to default are stripped (return undefined)
        expect(value("same", "same", "string")).toBeUndefined();
        expect(value(true, true, "bool")).toBeUndefined();
        expect(value(100, 100, "number")).toBeUndefined();
    });

    it("should return the value when different from default", () => {
        expect(value("test", "default", "string")).toBe("test");
        expect(value(true, false, "bool")).toBe(true);
        expect(value(123, 0, "number")).toBe(123);
    });

    it("should return undefined when value is undefined and undefinedAsDefault is false", () => {
        expect(value(undefined, "default", "string")).toBeUndefined();
        expect(value(undefined, true, "bool")).toBeUndefined();
        expect(value(undefined, 100, "number")).toBeUndefined();
    });

    it("should return default when value is undefined and undefinedAsDefault is true", () => {
        // With undefinedAsDefault=true, undefined is substituted with defaultValue
        // and since original value (undefined) !== defaultValue, the result is emitted
        expect(value(undefined, "default", "string", true)).toBe("default");
        expect(value(undefined, true, "bool", true)).toBe(true);
        expect(value(undefined, 100, "number", true)).toBe(100);
        expect(value(undefined, ["default"], "array", true)).toEqual(["default"]);
    });

    describe("string type", () => {
        it("should convert non-string values to string", () => {
            expect(value(123, "0", "string")).toBe("123");
            expect(value(true, "0", "string")).toBe("true");
        });
    });

    describe("bool type", () => {
        it("should coerce truthy/falsy values", () => {
            expect(value(1, false, "bool")).toBe(true);
            expect(value(0, true, "bool")).toBe(false);
            expect(value("anything", false, "bool")).toBe(true);
        });
    });

    describe("bool_auto type", () => {
        it("should pass through 'auto' as-is", () => {
            expect(value("auto", false, "bool_auto")).toBe("auto");
        });

        it("should coerce non-auto values to boolean", () => {
            expect(value(true, false, "bool_auto")).toBe(true);
            expect(value(0, true, "bool_auto")).toBe(false);
        });
    });

    describe("number type", () => {
        it("should parse numeric strings", () => {
            expect(value("123", 0, "number")).toBe(123);
            expect(value("123.45", 0, "number")).toBe(123.45);
        });

        it("should return undefined for non-numeric strings", () => {
            expect(value("abc", 0, "number")).toBeUndefined();
        });
    });

    describe("array type", () => {
        it("should pass through arrays", () => {
            expect(value(["a", "b"], [], "array")).toEqual(["a", "b"]);
        });

        it("should wrap single values in array", () => {
            expect(value("test", [], "array")).toEqual(["test"]);
            expect(value(123, [], "array")).toEqual([123]);
        });

        it("should wrap null in array", () => {
            expect(value(null, ["default"], "array")).toEqual([null]);
        });
    });
});
