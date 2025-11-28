// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { buildSortQuery } from "../sorting.js";

describe("buildSortQuery", () => {
    it("should return undefined for undefined input", () => {
        expect(buildSortQuery(undefined)).toBeUndefined();
    });

    it("should return undefined for empty array", () => {
        expect(buildSortQuery([])).toBeUndefined();
    });

    it("should build sort query with property only (defaults to ASC)", () => {
        const result = buildSortQuery(["title"]);
        expect(result).toEqual([
            {
                property: "title",
                direction: "ASC",
            },
        ]);
    });

    it("should build sort query with property and ASC direction", () => {
        const result = buildSortQuery(["title,asc"]);
        expect(result).toEqual([
            {
                property: "title",
                direction: "ASC",
            },
        ]);
    });

    it("should build sort query with property and DESC direction", () => {
        const result = buildSortQuery(["title,desc"]);
        expect(result).toEqual([
            {
                property: "title",
                direction: "DESC",
            },
        ]);
    });

    it("should handle case-insensitive direction (uppercase)", () => {
        const result = buildSortQuery(["title,ASC", "created,DESC"]);
        expect(result).toEqual([
            {
                property: "title",
                direction: "ASC",
            },
            {
                property: "created",
                direction: "DESC",
            },
        ]);
    });

    it("should handle case-insensitive direction (mixed case)", () => {
        const result = buildSortQuery(["title,Asc", "created,DeSc"]);
        expect(result).toEqual([
            {
                property: "title",
                direction: "ASC",
            },
            {
                property: "created",
                direction: "DESC",
            },
        ]);
    });

    it("should trim whitespace from property", () => {
        const result = buildSortQuery(["  title  ,desc", "  created  "]);
        expect(result).toEqual([
            {
                property: "title",
                direction: "DESC",
            },
            {
                property: "created",
                direction: "ASC",
            },
        ]);
    });

    it("should handle multiple sort properties", () => {
        const result = buildSortQuery(["title,asc", "created,desc", "updated"]);
        expect(result).toEqual([
            {
                property: "title",
                direction: "ASC",
            },
            {
                property: "created",
                direction: "DESC",
            },
            {
                property: "updated",
                direction: "ASC",
            },
        ]);
    });

    it("should skip empty strings", () => {
        const result = buildSortQuery(["title", "", "created"]);
        expect(result).toEqual([
            {
                property: "title",
                direction: "ASC",
            },
            {
                property: "created",
                direction: "ASC",
            },
        ]);
    });

    it("should skip strings with only whitespace property", () => {
        const result = buildSortQuery(["title", "   ,desc", "created"]);
        expect(result).toEqual([
            {
                property: "title",
                direction: "ASC",
            },
            {
                property: "created",
                direction: "ASC",
            },
        ]);
    });

    it("should return undefined when all inputs are invalid", () => {
        expect(buildSortQuery(["", "   "])).toBeUndefined();
    });

    it("should handle property with spaces", () => {
        const result = buildSortQuery(["created by,desc"]);
        expect(result).toEqual([
            {
                property: "created by",
                direction: "DESC",
            },
        ]);
    });

    it("should handle property with special characters", () => {
        const result = buildSortQuery(["createdAt,asc", "user.id,desc"]);
        expect(result).toEqual([
            {
                property: "createdAt",
                direction: "ASC",
            },
            {
                property: "user.id",
                direction: "DESC",
            },
        ]);
    });
});
