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
