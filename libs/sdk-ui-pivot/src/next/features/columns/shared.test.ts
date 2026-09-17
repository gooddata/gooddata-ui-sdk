// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITableDataValue, createIntlMock } from "@gooddata/sdk-ui";

import { createGrandTotalHeaderValue } from "../../testing/columnDefinitions.test.helpers.js";
import { type AgGridRowData } from "../../types/internal.js";

import { extractIntlFormattedValue } from "./shared.js";

const intl = createIntlMock({ "visualizations.totals.dropdown.title.sum": "Sum" });

function createGrandTotalRowCell(formattedValue: string): ITableDataValue {
    return createGrandTotalHeaderValue({
        attributeIdentifier: "row-attribute",
        totalType: "sum",
        formattedValue,
    });
}

function createRowData(cell: ITableDataValue, totals: unknown[]): AgGridRowData {
    return {
        cellDataByColId: { col1: cell },
        allRowData: [],
        dataView: {
            definition: {
                buckets: [{ localIdentifier: "attribute", totals }],
            },
        },
    } as unknown as AgGridRowData;
}

describe("extractIntlFormattedValue", () => {
    it("translates a raw total type when no custom alias applies", () => {
        const data = createRowData(createGrandTotalRowCell("sum"), []);

        expect(extractIntlFormattedValue({ data } as any, "col1", intl)).toBe("Sum");
    });

    it("preserves a custom alias verbatim even when it equals a raw total type key", () => {
        const data = createRowData(createGrandTotalRowCell("sum"), [
            { type: "sum", attributeIdentifier: "row-attribute", measureIdentifier: "measure", alias: "sum" },
        ]);

        expect(extractIntlFormattedValue({ data } as any, "col1", intl)).toBe("sum");
    });

    it("resolves the custom alias exactly once per call, not once to detect it and again to read it", () => {
        // Counting reads of the buckets the alias is resolved from (rather than spying on
        // resolveCustomTotalLabel itself) avoids a namespace import from a relative path, which is
        // disallowed - and it directly tests the observable invariant that actually matters.
        let bucketsAccessCount = 0;
        const data = {
            cellDataByColId: { col1: createGrandTotalRowCell("sum") },
            allRowData: [],
            dataView: {
                definition: {
                    get buckets() {
                        bucketsAccessCount++;
                        return [
                            {
                                localIdentifier: "attribute",
                                totals: [
                                    {
                                        type: "sum",
                                        attributeIdentifier: "row-attribute",
                                        measureIdentifier: "measure",
                                        alias: "Renamed total",
                                    },
                                ],
                            },
                        ];
                    },
                },
            },
        } as unknown as AgGridRowData;

        const result = extractIntlFormattedValue({ data } as any, "col1", intl);

        expect(result).toBe("Renamed total");
        expect(bucketsAccessCount).toBe(1);
    });
});
