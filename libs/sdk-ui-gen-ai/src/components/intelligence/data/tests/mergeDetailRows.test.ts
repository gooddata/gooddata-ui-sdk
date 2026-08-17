// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { mergeDetailRows } from "../mergeDetailRows.js";

describe("mergeDetailRows", () => {
    it("should keep a single-occurrence row untouched", () => {
        const result = mergeDetailRows([
            [{ labelId: "query", value: { kind: "text", text: "churn policy" } }],
        ]);

        expect(result).toEqual([{ labelId: "query", value: { kind: "text", text: "churn policy" } }]);
    });

    it("should concatenate list items across occurrences sharing the same row label", () => {
        const result = mergeDetailRows([
            [{ labelId: "activated", value: { kind: "list", items: [{ label: "Knowledge search" }] } }],
            [{ labelId: "activated", value: { kind: "list", items: [{ label: "Visualization" }] } }],
        ]);

        expect(result).toEqual([
            {
                labelId: "activated",
                value: {
                    kind: "list",
                    heading: undefined,
                    bulleted: undefined,
                    items: [{ label: "Knowledge search" }, { label: "Visualization" }],
                    truncatedCount: undefined,
                },
            },
        ]);
    });

    it("should use whichever occurrence authored a heading, regardless of order", () => {
        const result = mergeDetailRows([
            [{ labelId: "activated", value: { kind: "list", items: [{ label: "Knowledge search" }] } }],
            [
                {
                    labelId: "activated",
                    value: { kind: "list", heading: "2 skills", items: [{ label: "Visualization" }] },
                },
            ],
        ]);

        const row = result[0];
        expect(row.value.kind).toBe("list");
        expect(row.value.kind === "list" ? row.value.heading : undefined).toBe("2 skills");
    });

    it("should recount a merged list's heading from its items, not from the source counts", () => {
        const result = mergeDetailRows([
            [
                {
                    labelId: "available",
                    value: {
                        kind: "list",
                        heading: "skillsCount",
                        headingId: "skillsCount",
                        // Stale: neither its own item count nor half of the merged total.
                        headingValues: { count: 42 },
                        items: [{ label: "A" }, { label: "B" }],
                    },
                },
            ],
            [
                {
                    labelId: "available",
                    value: {
                        kind: "list",
                        heading: "skillsCount",
                        headingId: "skillsCount",
                        headingValues: { count: 0 },
                        items: [{ label: "C" }],
                    },
                },
            ],
        ]);

        const row = result[0].value;
        expect(row.kind === "list" ? row.headingValues : undefined).toEqual({ count: 3 });
    });

    it("should sum truncatedCount across occurrences", () => {
        const result = mergeDetailRows([
            [{ labelId: "useAlways", value: { kind: "list", items: [{ label: "A" }], truncatedCount: 3 } }],
            [{ labelId: "useAlways", value: { kind: "list", items: [{ label: "B" }], truncatedCount: 2 } }],
        ]);

        const row = result[0];
        expect(row.value.kind === "list" ? row.value.truncatedCount : undefined).toBe(5);
    });

    it("should concatenate groups across occurrences", () => {
        const result = mergeDetailRows([
            [
                {
                    labelId: "query",
                    value: { kind: "groups", groups: [{ heading: "1 metric", items: [{ label: "x" }] }] },
                },
            ],
            [
                {
                    labelId: "query",
                    value: { kind: "groups", groups: [{ heading: "1 dimension", items: [{ label: "y" }] }] },
                },
            ],
        ]);

        const row = result[0];
        expect(row.value.kind === "groups" ? row.value.groups : undefined).toEqual([
            { heading: "1 metric", items: [{ label: "x" }] },
            { heading: "1 dimension", items: [{ label: "y" }] },
        ]);
    });

    it("should merge groups sharing the same heading identity, restating the count", () => {
        const found = (objectType: string, ...titles: string[]) => ({
            labelId: "found",
            value: {
                kind: "groups" as const,
                groups: [
                    {
                        heading: "foundGroup",
                        headingId: "foundGroup",
                        headingValues: { count: titles.length, objectType },
                        items: titles.map((label) => ({ label })),
                    },
                ],
            },
        });

        const result = mergeDetailRows([
            [found("metric", "dssadjasdjkass", "zbe")],
            [found("visualization", "eBay Budget", "suma")],
            [found("fact", "Price", "Spend")],
            [found("metric", "Sales", "price")],
            [found("visualization", "Ebay", "das")],
        ]);

        const row = result[0];
        expect(row.value.kind === "groups" ? row.value.groups : undefined).toEqual([
            {
                heading: "foundGroup",
                headingId: "foundGroup",
                headingValues: { count: 4, objectType: "metric" },
                items: [
                    { label: "dssadjasdjkass" },
                    { label: "zbe" },
                    { label: "Sales" },
                    { label: "price" },
                ],
                truncatedCount: undefined,
            },
            {
                heading: "foundGroup",
                headingId: "foundGroup",
                headingValues: { count: 4, objectType: "visualization" },
                items: [{ label: "eBay Budget" }, { label: "suma" }, { label: "Ebay" }, { label: "das" }],
                truncatedCount: undefined,
            },
            {
                heading: "foundGroup",
                headingId: "foundGroup",
                headingValues: { count: 2, objectType: "fact" },
                items: [{ label: "Price" }, { label: "Spend" }],
            },
        ]);
    });

    it("should keep repeated titles when merging groups", () => {
        const group = (objectType: string, ...titles: string[]) => ({
            heading: "foundGroup",
            headingId: "foundGroup",
            headingValues: { count: titles.length, objectType },
            items: titles.map((label) => ({ label })),
        });

        const result = mergeDetailRows([
            [{ labelId: "found", value: { kind: "groups", groups: [group("metric", "Sales", "price")] } }],
            [{ labelId: "found", value: { kind: "groups", groups: [group("metric", "price", "Revenue")] } }],
        ]);

        const merged = result[0].value.kind === "groups" ? result[0].value.groups[0] : undefined;
        expect(merged?.items).toEqual([
            { label: "Sales" },
            { label: "price" },
            { label: "price" },
            { label: "Revenue" },
        ]);
        expect(merged?.headingValues?.["count"]).toBe(4);
    });

    it("should re-apply the item cap when merged groups overflow", () => {
        const group = (...titles: string[]) => ({
            heading: "foundGroup",
            headingId: "foundGroup",
            headingValues: { count: titles.length, objectType: "metric" },
            items: titles.map((label) => ({ label })),
        });

        const result = mergeDetailRows([
            [{ labelId: "found", value: { kind: "groups", groups: [group("a", "b", "c", "d")] } }],
            [{ labelId: "found", value: { kind: "groups", groups: [group("e", "f", "g")] } }],
        ]);

        const merged = result[0].value.kind === "groups" ? result[0].value.groups[0] : undefined;
        expect(merged?.items).toHaveLength(5);
        expect(merged?.truncatedCount).toBe(2);
        // The heading still describes every occurrence, including the truncated remainder.
        expect(merged?.headingValues?.["count"]).toBe(7);
    });

    it("should recount a merged group from its items, not from the source counts", () => {
        // Counts that agree with neither each other nor their items: summing them would give 9,
        // and carrying the first would give 7. Only recounting the merged items gives 3.
        const group = (count: number, ...titles: string[]) => ({
            heading: "foundGroup",
            headingId: "foundGroup",
            headingValues: { count, objectType: "metric" },
            items: titles.map((label) => ({ label })),
        });

        const result = mergeDetailRows([
            [{ labelId: "found", value: { kind: "groups", groups: [group(7, "a", "b")] } }],
            [{ labelId: "found", value: { kind: "groups", groups: [group(2, "c")] } }],
        ]);

        const merged = result[0].value.kind === "groups" ? result[0].value.groups[0] : undefined;
        expect(merged?.items).toHaveLength(3);
        expect(merged?.headingValues?.["count"]).toBe(3);
    });

    it("should recount a truncated merged group from its items plus the remainder", () => {
        // Same idea past the cap: the count has to come from the items kept plus the ones
        // dropped, not from any source count.
        const group = (count: number, ...titles: string[]) => ({
            heading: "foundGroup",
            headingId: "foundGroup",
            headingValues: { count, objectType: "metric" },
            items: titles.map((label) => ({ label })),
        });

        const result = mergeDetailRows([
            [{ labelId: "found", value: { kind: "groups", groups: [group(99, "a", "b", "c", "d")] } }],
            [{ labelId: "found", value: { kind: "groups", groups: [group(0, "e", "f", "g")] } }],
        ]);

        const merged = result[0].value.kind === "groups" ? result[0].value.groups[0] : undefined;
        expect(merged?.items).toHaveLength(5);
        expect(merged?.truncatedCount).toBe(2);
        expect(merged?.headingValues?.["count"]).toBe(7);
    });

    it("should merge groups sharing a headingId that interpolates nothing", () => {
        const group = (...titles: string[]) => ({
            heading: "resultsGroup",
            headingId: "resultsGroup",
            items: titles.map((label) => ({ label })),
        });

        const result = mergeDetailRows([
            [{ labelId: "found", value: { kind: "groups", groups: [group("x")] } }],
            [{ labelId: "found", value: { kind: "groups", groups: [group("y")] } }],
        ]);

        const groups = result[0].value.kind === "groups" ? result[0].value.groups : undefined;
        expect(groups).toHaveLength(1);
        expect(groups?.[0].items).toEqual([{ label: "x" }, { label: "y" }]);
    });

    it("should not collide groups whose heading values differ only in type or delimiters", () => {
        const group = (objectType: string | number, extra: string) => ({
            heading: "foundGroup",
            headingId: "foundGroup",
            headingValues: { objectType, extra },
            items: [{ label: `${objectType}/${extra}` }],
        });

        const result = mergeDetailRows([
            [
                {
                    labelId: "found",
                    value: {
                        kind: "groups",
                        // Concatenating "name=value" pairs would render both as "extra=2,objectType=1".
                        groups: [group(1, "2"), group("1", "2"), group("1,extra=2", "")],
                    },
                },
            ],
        ]);

        expect(result[0].value.kind === "groups" ? result[0].value.groups : undefined).toHaveLength(3);
    });

    it("should keep an unkeyed group in its original position", () => {
        const keyed = (objectType: string, label: string) => ({
            heading: "foundGroup",
            headingId: "foundGroup",
            headingValues: { count: 1, objectType },
            items: [{ label }],
        });

        const result = mergeDetailRows([
            [
                {
                    labelId: "found",
                    value: {
                        kind: "groups",
                        groups: [keyed("metric", "a"), { items: [{ label: "unkeyed" }] }],
                    },
                },
            ],
            [{ labelId: "found", value: { kind: "groups", groups: [keyed("metric", "b")] } }],
        ]);

        const groups = result[0].value.kind === "groups" ? result[0].value.groups : undefined;
        expect(groups?.map((group) => group.items)).toEqual([
            [{ label: "a" }, { label: "b" }],
            [{ label: "unkeyed" }],
        ]);
    });

    it("should not pool groups that carry no heading", () => {
        const result = mergeDetailRows([
            [{ labelId: "found", value: { kind: "groups", groups: [{ items: [{ label: "x" }] }] } }],
            [{ labelId: "found", value: { kind: "groups", groups: [{ items: [{ label: "y" }] }] } }],
        ]);

        expect(result[0].value.kind === "groups" ? result[0].value.groups : undefined).toEqual([
            { items: [{ label: "x" }] },
            { items: [{ label: "y" }] },
        ]);
    });

    it("should stack repeated text values into a plain unbulleted list", () => {
        const result = mergeDetailRows([
            [{ labelId: "result", value: { kind: "text", text: "1 row, 1 column" } }],
            [{ labelId: "result", value: { kind: "text", text: "2 rows, 1 column" } }],
        ]);

        const row = result[0];
        expect(row.value).toEqual({
            kind: "list",
            bulleted: false,
            items: [{ label: "1 row, 1 column" }, { label: "2 rows, 1 column" }],
        });
    });
});
