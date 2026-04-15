// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { CoreErrorCode, type ICoreError } from "../errors.js";
import { createFilterContextItemKeyName, createFilterItemKeyName, getIdentifier } from "../yamlUtils.js";

describe("yamlUtils", () => {
    describe("getIdentifier", () => {
        it("should return localIdentifier for localIdRef", () => {
            expect(getIdentifier({ localIdentifier: "foo" })).toBe("foo");
        });

        it("should throw error with context when reference type is not supported", () => {
            const context = { type: "test", path: ["root"] };
            try {
                getIdentifier({ uri: "/foo" }, true, context);
                expect.fail("Should have thrown error");
            } catch (err: unknown) {
                const error = err as ICoreError;
                expect(error.code).toBe(CoreErrorCode.ReferenceTypeNotSupported);
                expect(error.context).toEqual(context);
                expect(error.message).toContain("in: root");
            }
        });
    });

    describe("createFilterContextItemKeyName", () => {
        it("should throw error with context for unsupported item", () => {
            const context = { type: "test", path: ["dashboard"] };
            try {
                // @ts-expect-error - passing invalid item
                createFilterContextItemKeyName({ unknown: "item" }, "date", context);
                expect.fail("Should have thrown error");
            } catch (err: unknown) {
                const error = err as ICoreError;
                expect(error.code).toBe(CoreErrorCode.ItemNotSupported);
                expect(error.context).toEqual(context);
                expect(error.message).toContain("in: dashboard");
            }
        });

        it("should propagate context to getIdentifier in date filter", () => {
            const context = { type: "test", path: ["dashboard"] };
            const item: any = {
                dateFilter: {
                    dataSet: { uri: "/foo" }, // invalid for getIdentifier
                    granularity: "GDC.time.year",
                },
            };
            try {
                createFilterContextItemKeyName(item, "date", context);
                expect.fail("Should have thrown error");
            } catch (err: unknown) {
                const error = err as ICoreError;
                expect(error.context?.path).toEqual(["dashboard", "dateFilter", "dataSet"]);
            }
        });
    });

    describe("createFilterItemKeyName", () => {
        it("should throw error with context for unsupported item", () => {
            const context = { type: "test", path: ["filter"] };
            try {
                // @ts-expect-error - passing invalid item
                createFilterItemKeyName({ unknown: "item" }, "date", context);
                expect.fail("Should have thrown error");
            } catch (err: unknown) {
                const error = err as ICoreError;
                expect(error.code).toBe(CoreErrorCode.ItemNotSupported);
                expect(error.context).toEqual(context);
                expect(error.message).toContain("in: filter");
            }
        });

        it("should propagate context to getIdentifier in absolute date filter", () => {
            const context = { type: "test", path: ["filter"] };
            const item: any = {
                absoluteDateFilter: {
                    dataSet: { uri: "/foo" }, // invalid for getIdentifier
                },
            };
            try {
                createFilterItemKeyName(item, "date", context);
                expect.fail("Should have thrown error");
            } catch (err: unknown) {
                const error = err as ICoreError;
                expect(error.context?.path).toEqual(["filter", "absoluteDateFilter", "dataSet"]);
            }
        });
    });
});
