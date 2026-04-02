// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ISeriesDataItem } from "../../typings/unsafe.js";
import { coalesceNulls, skipLeadingZeros } from "../dataSanitizers.js";

describe("coalesceNulls", () => {
    it("should replace null y with 0", () => {
        const item: ISeriesDataItem = { y: null, name: "a" };
        const result = coalesceNulls(item);
        expect(result.y).toBe(0);
        expect(result.name).toBe("a");
    });

    it("should not add y when the property is absent", () => {
        const item: ISeriesDataItem = { name: "a" };
        const result = coalesceNulls(item);
        expect(result).toBe(item);
        expect("y" in result).toBe(false);
    });

    it("should replace explicitly undefined y with 0", () => {
        const item: ISeriesDataItem = { y: undefined, name: "a" };
        const result = coalesceNulls(item);
        expect(result.y).toBe(0);
    });

    it("should preserve y when it is 0", () => {
        const item: ISeriesDataItem = { y: 0, name: "a" };
        const result = coalesceNulls(item);
        expect(result.y).toBe(0);
    });

    it("should return the same reference when no changes are needed", () => {
        const item: ISeriesDataItem = { y: 5, name: "a" };
        const result = coalesceNulls(item);
        expect(result).toBe(item);
    });

    it("should not create a new object for y=0 leaf nodes", () => {
        const item: ISeriesDataItem = { y: 0 };
        const result = coalesceNulls(item);
        // y=0 is not null/undefined, no nested data → same reference
        expect(result).toBe(item);
    });

    it("should preserve non-null numeric y values", () => {
        const item: ISeriesDataItem = { y: 42 };
        const result = coalesceNulls(item);
        expect(result.y).toBe(42);
    });

    it("should recursively coalesce nulls in nested data", () => {
        const item: ISeriesDataItem = {
            y: 10,
            data: [
                { y: null, name: "child1" },
                { y: 5, name: "child2" },
            ],
        };
        const result = coalesceNulls(item);
        expect(result.data![0].y).toBe(0);
        expect(result.data![0].name).toBe("child1");
        expect(result.data![1].y).toBe(5);
    });

    it("should handle deeply nested data", () => {
        const item: ISeriesDataItem = {
            y: 1,
            data: [
                {
                    y: 2,
                    data: [{ y: null, name: "deep" }],
                },
            ],
        };
        const result = coalesceNulls(item);
        expect(result.data![0].data![0].y).toBe(0);
        expect(result.data![0].data![0].name).toBe("deep");
    });

    it("should handle empty data array without creating a new object", () => {
        const item: ISeriesDataItem = { y: 5, data: [] };
        const result = coalesceNulls(item);
        expect(result).toBe(item);
    });

    it("should handle item with no data property", () => {
        const item: ISeriesDataItem = { y: null };
        const result = coalesceNulls(item);
        expect(result.y).toBe(0);
        expect(result.data).toBeUndefined();
    });

    it("should preserve all other properties", () => {
        const item: ISeriesDataItem = {
            y: null,
            x: 1,
            name: "test",
            color: "red",
            isSum: true,
            visible: false,
        };
        const result = coalesceNulls(item);
        expect(result).toEqual({
            y: 0,
            x: 1,
            name: "test",
            color: "red",
            isSum: true,
            visible: false,
        });
    });
});

describe("skipLeadingZeros", () => {
    it("should remove leading items with y=0", () => {
        const values: ISeriesDataItem[] = [{ y: 0 }, { y: 0 }, { y: 5 }, { y: 3 }];
        const result = skipLeadingZeros(values);
        expect(result).toEqual([{ y: 5 }, { y: 3 }]);
    });

    it("should return the same reference when no leading zeros", () => {
        const values: ISeriesDataItem[] = [{ y: 1 }, { y: 0 }, { y: 3 }];
        const result = skipLeadingZeros(values);
        expect(result).toBe(values);
    });

    it("should return empty array when all items are zero", () => {
        const values: ISeriesDataItem[] = [{ y: 0 }, { y: 0 }];
        const result = skipLeadingZeros(values);
        expect(result).toEqual([]);
    });

    it("should return the same reference for empty array", () => {
        const values: ISeriesDataItem[] = [];
        const result = skipLeadingZeros(values);
        expect(result).toBe(values);
    });

    it("should not skip items with null y", () => {
        const values: ISeriesDataItem[] = [{ y: null }, { y: 0 }, { y: 5 }];
        const result = skipLeadingZeros(values);
        expect(result).toBe(values);
    });

    it("should not skip items without y property", () => {
        const values: ISeriesDataItem[] = [{ name: "a" }, { y: 0 }, { y: 5 }];
        const result = skipLeadingZeros(values);
        expect(result).toBe(values);
    });

    it("should preserve trailing zeros", () => {
        const values: ISeriesDataItem[] = [{ y: 0 }, { y: 5 }, { y: 0 }];
        const result = skipLeadingZeros(values);
        expect(result).toEqual([{ y: 5 }, { y: 0 }]);
    });

    it("should handle single non-zero element", () => {
        const values: ISeriesDataItem[] = [{ y: 7 }];
        const result = skipLeadingZeros(values);
        expect(result).toBe(values);
    });

    it("should handle single zero element", () => {
        const values: ISeriesDataItem[] = [{ y: 0 }];
        const result = skipLeadingZeros(values);
        expect(result).toEqual([]);
    });
});
