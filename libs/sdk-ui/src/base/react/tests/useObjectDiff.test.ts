// (C) 2025 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getObjectDiff, useObjectDiff } from "../useObjectDiff.js";

describe("getObjectDiff", () => {
    describe("when comparing objects with new keys", () => {
        it("should detect new keys when previous object is null", () => {
            const result = getObjectDiff(null, { a: 1, b: 2 });

            expect(result).toEqual({
                NEW: ["a", "b"],
                hasChanged: true,
            });
        });

        it("should detect new keys when previous object exists", () => {
            const result = getObjectDiff({ a: 1 }, { a: 1, b: 2, c: 3 });

            expect(result).toEqual({
                NEW: ["b", "c"],
                hasChanged: true,
            });
        });
    });

    describe("when comparing objects with removed keys", () => {
        it("should detect removed keys", () => {
            const result = getObjectDiff({ a: 1, b: 2, c: 3 }, { a: 1 });

            expect(result).toEqual({
                REMOVED: ["b", "c"],
                hasChanged: true,
            });
        });

        it("should handle empty current object", () => {
            const result = getObjectDiff({ a: 1, b: 2 }, {});

            expect(result).toEqual({
                REMOVED: ["a", "b"],
                hasChanged: true,
            });
        });
    });

    describe("when comparing objects with changed values", () => {
        it("should detect changed values with default equality function", () => {
            const result = getObjectDiff({ a: 1, b: 2, c: 3 }, { a: 1, b: 5, c: 3 });

            expect(result).toEqual({
                CHANGED: ["b"],
                hasChanged: true,
            });
        });

        it("should detect multiple changed values", () => {
            const result = getObjectDiff({ a: 1, b: 2, c: 3 }, { a: 10, b: 20, c: 3 });

            expect(result).toEqual({
                CHANGED: ["a", "b"],
                hasChanged: true,
            });
        });

        it("should handle object references with default equality", () => {
            const obj1 = { x: 1 };
            const obj2 = { x: 1 };
            const result = getObjectDiff({ a: obj1 }, { a: obj2 });

            expect(result).toEqual({
                hasChanged: false,
            });
        });

        it("should detect deep changes in nested objects", () => {
            const prev = { user: { name: "John", age: 30 } };
            const curr = { user: { name: "John", age: 31 } };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["user"],
                DEEP_CHANGES: {
                    user: {
                        CHANGED: ["age"],
                        hasChanged: true,
                    },
                },
                hasChanged: true,
            });
        });

        it("should detect multiple levels of nesting", () => {
            const prev = { data: { user: { profile: { theme: "dark" } } } };
            const curr = { data: { user: { profile: { theme: "light" } } } };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["data"],
                DEEP_CHANGES: {
                    data: {
                        CHANGED: ["user"],
                        DEEP_CHANGES: {
                            user: {
                                CHANGED: ["profile"],
                                DEEP_CHANGES: {
                                    profile: {
                                        CHANGED: ["theme"],
                                        hasChanged: true,
                                    },
                                },
                                hasChanged: true,
                            },
                        },
                        hasChanged: true,
                    },
                },
                hasChanged: true,
            });
        });

        it("should handle mixed primitive and object changes", () => {
            const prev = { count: 5, user: { name: "John" }, active: true };
            const curr = { count: 10, user: { name: "Jane" }, active: true };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["count", "user"],
                DEEP_CHANGES: {
                    user: {
                        CHANGED: ["name"],
                        hasChanged: true,
                    },
                },
                hasChanged: true,
            });
        });

        it("should not create deep changes for arrays (treated as primitives)", () => {
            const prev = { items: [1, 2, 3] };
            const curr = { items: [1, 2, 4] };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["items"],
                hasChanged: true,
            });
        });

        it("should handle nested objects with new and removed keys", () => {
            const prev = { config: { theme: "dark", lang: "en" } };
            const curr = { config: { theme: "light", region: "us" } };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["config"],
                DEEP_CHANGES: {
                    config: {
                        NEW: ["region"],
                        REMOVED: ["lang"],
                        CHANGED: ["theme"],
                        hasChanged: true,
                    },
                },
                hasChanged: true,
            });
        });
    });

    describe("when using custom equality function", () => {
        it("should use custom equality function for comparison", () => {
            const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
            const obj1 = { x: 1 };
            const obj2 = { x: 1 };

            const result = getObjectDiff({ a: obj1 }, { a: obj2 }, deepEqual);

            expect(result).toEqual({
                hasChanged: false,
            });
        });

        it("should detect changes with custom equality function", () => {
            const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
            const obj1 = { x: 1 };
            const obj2 = { x: 2 };

            const result = getObjectDiff({ a: obj1 }, { a: obj2 }, deepEqual);

            expect(result).toEqual({
                CHANGED: ["a"],
                DEEP_CHANGES: {
                    a: {
                        CHANGED: ["x"],
                        hasChanged: true,
                    },
                },
                hasChanged: true,
            });
        });

        it("should use custom equality for nested objects", () => {
            const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
            const prev = { config: { theme: "dark" } };
            const curr = { config: { theme: "dark" } }; // Same content, different reference

            const result = getObjectDiff(prev, curr, deepEqual);

            expect(result).toEqual({
                hasChanged: false,
            });
        });

        it("should detect deep changes with custom equality", () => {
            const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
            const prev = { config: { theme: "dark", lang: "en" } };
            const curr = { config: { theme: "light", lang: "en" } };

            const result = getObjectDiff(prev, curr, deepEqual);

            expect(result).toEqual({
                CHANGED: ["config"],
                DEEP_CHANGES: {
                    config: {
                        CHANGED: ["theme"],
                        hasChanged: true,
                    },
                },
                hasChanged: true,
            });
        });
    });

    describe("when comparing objects with mixed changes", () => {
        it("should detect new, removed, and changed keys simultaneously", () => {
            const result = getObjectDiff({ a: 1, b: 2, c: 3 }, { a: 10, d: 4, e: 5 });

            expect(result).toEqual({
                NEW: ["d", "e"],
                REMOVED: ["b", "c"],
                CHANGED: ["a"],
                hasChanged: true,
            });
        });
    });

    describe("when objects are identical", () => {
        it("should return no changes for identical objects", () => {
            const result = getObjectDiff({ a: 1, b: 2 }, { a: 1, b: 2 });

            expect(result).toEqual({
                hasChanged: false,
            });
        });

        it("should return no changes for empty objects", () => {
            const result = getObjectDiff({}, {});

            expect(result).toEqual({
                hasChanged: false,
            });
        });
    });

    describe("deep diff edge cases", () => {
        it("should handle null and undefined in nested objects", () => {
            const prev = { config: { value: null } };
            const curr = { config: { value: undefined } };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["config"],
                DEEP_CHANGES: {
                    config: {
                        CHANGED: ["value"],
                        hasChanged: true,
                    },
                },
                hasChanged: true,
            });
        });

        it("should handle empty nested objects", () => {
            const prev = { data: {} };
            const curr = { data: { key: "value" } };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["data"],
                DEEP_CHANGES: {
                    data: {
                        NEW: ["key"],
                        hasChanged: true,
                    },
                },
                hasChanged: true,
            });
        });

        it("should handle object to primitive changes", () => {
            const prev = { value: { nested: true } };
            const curr = { value: "string" };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["value"],
                hasChanged: true,
            });
        });

        it("should handle primitive to object changes", () => {
            const prev = { value: "string" };
            const curr = { value: { nested: true } };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["value"],
                hasChanged: true,
            });
        });

        it("should not recurse into arrays", () => {
            const prev = { items: [{ id: 1 }] };
            const curr = { items: [{ id: 2 }] };
            const result = getObjectDiff(prev, curr);

            expect(result).toEqual({
                CHANGED: ["items"],
                hasChanged: true,
            });
            expect(result.DEEP_CHANGES).toBeUndefined();
        });
    });

    describe("edge cases", () => {
        it("should handle undefined and null values", () => {
            const result = getObjectDiff({ a: undefined, b: null }, { a: null, b: undefined });

            expect(result).toEqual({
                CHANGED: ["a", "b"],
                hasChanged: true,
            });
        });

        it("should handle falsy values", () => {
            const result = getObjectDiff({ a: 0, b: false, c: "" }, { a: 0, b: false, c: "" });

            expect(result).toEqual({
                hasChanged: false,
            });
        });
    });
});

describe("useObjectDiff hook", () => {
    it("should return initial diff on first render", () => {
        const { result } = renderHook(() => useObjectDiff({ a: 1, b: 2 }));

        expect(result.current).toEqual({
            NEW: ["a", "b"],
            hasChanged: true,
        });
    });

    it("should detect changes when object is updated", () => {
        const { result, rerender } = renderHook(
            ({ obj }: { obj: Record<string, any> }) => useObjectDiff(obj),
            { initialProps: { obj: { a: 1, b: 2 } as Record<string, any> } },
        );

        // Initial render
        expect(result.current).toEqual({
            NEW: ["a", "b"],
            hasChanged: true,
        });

        // Update with new object
        act(() => {
            rerender({ obj: { a: 1, b: 3, c: 4 } as Record<string, any> });
        });

        expect(result.current).toEqual({
            NEW: ["c"],
            CHANGED: ["b"],
            hasChanged: true,
        });
    });

    it("should detect removed keys", () => {
        const { result, rerender } = renderHook(
            ({ obj }: { obj: Record<string, any> }) => useObjectDiff(obj),
            { initialProps: { obj: { a: 1, b: 2, c: 3 } as Record<string, any> } },
        );

        // Update with fewer keys
        act(() => {
            rerender({ obj: { a: 1 } as Record<string, any> });
        });

        expect(result.current).toEqual({
            REMOVED: ["b", "c"],
            hasChanged: true,
        });
    });

    it("should return no changes when object remains the same", () => {
        const obj = { a: 1, b: 2 };
        const { result, rerender } = renderHook(
            ({ obj }: { obj: Record<string, any> }) => useObjectDiff(obj),
            { initialProps: { obj } },
        );

        // Initial render shows new keys since there was no previous object
        expect(result.current).toEqual({
            NEW: ["a", "b"],
            hasChanged: true,
        });

        // Update with same object reference
        act(() => {
            rerender({ obj });
        });

        expect(result.current).toEqual({
            hasChanged: false,
        });
    });

    it("should handle multiple consecutive updates", () => {
        const { result, rerender } = renderHook(
            ({ obj }: { obj: Record<string, any> }) => useObjectDiff(obj),
            { initialProps: { obj: { a: 1 } as Record<string, any> } },
        );

        // First update
        act(() => {
            rerender({ obj: { a: 1, b: 2 } as Record<string, any> });
        });

        expect(result.current).toEqual({
            NEW: ["b"],
            hasChanged: true,
        });

        // Second update
        act(() => {
            rerender({ obj: { a: 2, b: 2 } as Record<string, any> });
        });

        expect(result.current).toEqual({
            CHANGED: ["a"],
            hasChanged: true,
        });

        // Third update - no changes
        act(() => {
            rerender({ obj: { a: 2, b: 2 } as Record<string, any> });
        });

        expect(result.current).toEqual({
            hasChanged: false,
        });
    });

    it("should handle empty object transitions", () => {
        const { result, rerender } = renderHook(
            ({ obj }: { obj: Record<string, any> }) => useObjectDiff(obj),
            { initialProps: { obj: {} } },
        );

        // Initial empty object
        expect(result.current).toEqual({
            hasChanged: false,
        });

        // Add properties
        act(() => {
            rerender({ obj: { a: 1, b: 2 } });
        });

        expect(result.current).toEqual({
            NEW: ["a", "b"],
            hasChanged: true,
        });

        // Back to empty
        act(() => {
            rerender({ obj: {} });
        });

        expect(result.current).toEqual({
            REMOVED: ["a", "b"],
            hasChanged: true,
        });
    });

    it("should handle complex object values", () => {
        const obj1 = { a: { nested: 1 }, b: [1, 2, 3] };
        const obj2 = { a: { nested: 1 }, b: [1, 2, 3] };
        const obj3 = { a: { nested: 2 }, b: [1, 2, 4] };

        const { result, rerender } = renderHook(
            ({ obj }: { obj: Record<string, any> }) => useObjectDiff(obj),
            { initialProps: { obj: obj1 } },
        );

        // Update with different object but same structure (reference equality)
        act(() => {
            rerender({ obj: obj2 });
        });

        expect(result.current).toEqual({
            CHANGED: ["b"], // Only array b is detected as changed due to reference inequality
            hasChanged: true,
        });

        // Update with different values
        act(() => {
            rerender({ obj: obj3 });
        });

        expect(result.current).toEqual({
            CHANGED: ["a", "b"],
            DEEP_CHANGES: {
                a: {
                    CHANGED: ["nested"],
                    hasChanged: true,
                },
            },
            hasChanged: true,
        });
    });

    it("should detect deep changes in hook usage", () => {
        const { result, rerender } = renderHook(
            ({ obj }: { obj: Record<string, any> }) => useObjectDiff(obj),
            { initialProps: { obj: { user: { name: "John", age: 30 } } } },
        );

        // Update nested property
        act(() => {
            rerender({ obj: { user: { name: "John", age: 31 } } });
        });

        expect(result.current).toEqual({
            CHANGED: ["user"],
            DEEP_CHANGES: {
                user: {
                    CHANGED: ["age"],
                    hasChanged: true,
                },
            },
            hasChanged: true,
        });
    });

    it("should work with custom equality function for deep objects", () => {
        const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
        const obj1 = { user: { name: "John" } };
        const obj2 = { user: { name: "John" } }; // Same content, different reference

        const { result, rerender } = renderHook(
            ({ obj }: { obj: Record<string, any> }) => useObjectDiff(obj, deepEqual),
            { initialProps: { obj: obj1 } },
        );

        // Update with same content but different reference
        act(() => {
            rerender({ obj: obj2 });
        });

        expect(result.current).toEqual({
            hasChanged: false,
        });
    });
});
