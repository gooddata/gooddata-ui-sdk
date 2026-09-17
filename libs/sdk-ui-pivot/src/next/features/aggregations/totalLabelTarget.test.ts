// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    createAttributeColumnDefinition,
    createGrandTotalColumnDefinition,
    createGrandTotalHeaderValue,
    createMeasureGroupHeaderColumnDefinition,
    createSubtotalHeaderValue,
} from "../../testing/columnDefinitions.test.helpers.js";
import { type AgGridRowData } from "../../types/internal.js";

import {
    isFirstTotalHeaderAttributeCell,
    resolveTotalLabelTargetFromColumnDefinition,
    resolveTotalLabelTargetFromTotalLabelCellData,
} from "./totalLabelTarget.js";

describe("resolveTotalLabelTargetFromColumnDefinition", () => {
    it("resolves a grand total column", () => {
        const columnDefinition = createGrandTotalColumnDefinition(["column-attribute"], "MIN");

        expect(resolveTotalLabelTargetFromColumnDefinition(columnDefinition)).toEqual({
            type: "min",
            attributeIdentifier: "column-attribute",
            bucketType: "columns",
        });
    });

    it("resolves a grand total spanning multiple column attributes by its outermost total scope", () => {
        const columnDefinition = createGrandTotalColumnDefinition(
            ["outer-attribute", "inner-attribute"],
            "SUM",
        );

        expect(resolveTotalLabelTargetFromColumnDefinition(columnDefinition)).toEqual({
            type: "sum",
            attributeIdentifier: "outer-attribute",
            bucketType: "columns",
        });
    });
});

describe("resolveTotalLabelTargetFromTotalLabelCellData", () => {
    it("resolves a grand total row label cell specific to one measure (the transposed case)", () => {
        const cellData = createGrandTotalHeaderValue({
            attributeIdentifier: "row-attribute",
            totalType: "sum",
            measureIdentifiers: ["revenue"],
        });

        expect(resolveTotalLabelTargetFromTotalLabelCellData(cellData)).toEqual({
            type: "sum",
            attributeIdentifier: "row-attribute",
            bucketType: "attribute",
            measureIdentifier: "revenue",
        });
    });

    it("resolves a grand total row label cell shared by several coalesced measures without a measureIdentifier", () => {
        const cellData = createGrandTotalHeaderValue({
            attributeIdentifier: "row-attribute",
            totalType: "sum",
            measureIdentifiers: ["revenue", "profit"],
        });

        expect(resolveTotalLabelTargetFromTotalLabelCellData(cellData)).toEqual({
            type: "sum",
            attributeIdentifier: "row-attribute",
            bucketType: "attribute",
        });
    });

    it("resolves a subtotal row label cell shared across measures (the non-transposed case) without a measureIdentifier", () => {
        const cellData = createSubtotalHeaderValue({
            attributeIdentifier: "subtotal-attribute",
            totalWireType: "MAX",
            totalName: "Custom subtotal",
        });

        expect(resolveTotalLabelTargetFromTotalLabelCellData(cellData)).toEqual({
            type: "max",
            attributeIdentifier: "subtotal-attribute",
            bucketType: "attribute",
        });
    });

    it("resolves a subtotal row label cell specific to one measure (the transposed case)", () => {
        const cellData = createSubtotalHeaderValue({
            attributeIdentifier: "subtotal-attribute",
            totalWireType: "MAX",
            subtotalMeasureIdentifier: "revenue",
        });

        expect(resolveTotalLabelTargetFromTotalLabelCellData(cellData)).toEqual({
            type: "max",
            attributeIdentifier: "subtotal-attribute",
            bucketType: "attribute",
            measureIdentifier: "revenue",
        });
    });

    it("does not resolve a transposed subtotal measure-name cell", () => {
        const cellData = createSubtotalHeaderValue({
            attributeIdentifier: "subtotal-attribute",
            totalWireType: "SUM",
            measureIndex: 0,
            columnDefinition: createMeasureGroupHeaderColumnDefinition(),
        });

        expect(resolveTotalLabelTargetFromTotalLabelCellData(cellData)).toBeUndefined();
    });

    it("does not resolve a transposed grand total measure-name cell", () => {
        const cellData = createGrandTotalHeaderValue({
            attributeIdentifier: "row-attribute",
            totalType: "sum",
            columnDefinition: createMeasureGroupHeaderColumnDefinition(),
        });

        expect(resolveTotalLabelTargetFromTotalLabelCellData(cellData)).toBeUndefined();
    });
});

describe("isFirstTotalHeaderAttributeCell", () => {
    const rowData: AgGridRowData = {
        allRowData: [],
        cellDataByColId: {
            country: createGrandTotalHeaderValue({
                attributeIdentifier: "country",
                totalType: "sum",
                columnDefinition: createAttributeColumnDefinition("country", 0),
            }),
            city: createGrandTotalHeaderValue({
                attributeIdentifier: "country",
                totalType: "sum",
                columnDefinition: createAttributeColumnDefinition("city", 1),
            }),
            revenue: {
                type: "grandTotalValue",
                formattedValue: "100",
                value: 100,
                rowIndex: 0,
                columnIndex: 2,
                rowDefinition: { type: "value", rowIndex: 0, rowScope: [] },
                columnDefinition: createGrandTotalColumnDefinition(["country"], "SUM"),
            },
        },
    };

    it("identifies the leftmost (lowest columnIndex) attribute column as the one that displays the label", () => {
        expect(isFirstTotalHeaderAttributeCell(rowData, "country")).toBe(true);
    });

    it("treats every other attribute column carrying the same total header as a blank duplicate", () => {
        expect(isFirstTotalHeaderAttributeCell(rowData, "city")).toBe(false);
    });

    it("returns false for a non-attribute column even if it's a total cell", () => {
        expect(isFirstTotalHeaderAttributeCell(rowData, "revenue")).toBe(false);
    });

    it("returns false for a row with no total-header attribute cells", () => {
        const valueRow: AgGridRowData = {
            allRowData: [],
            cellDataByColId: {
                country: {
                    type: "attributeHeader",
                    formattedValue: "USA",
                    value: { attributeHeaderItem: { name: "USA", uri: "/uri" } },
                    rowIndex: 0,
                    columnIndex: 0,
                    rowDefinition: { type: "value", rowIndex: 0, rowScope: [] },
                    columnDefinition: createAttributeColumnDefinition("country", 0),
                },
            },
        };

        expect(isFirstTotalHeaderAttributeCell(valueRow, "country")).toBe(false);
    });

    it("returns false when rowData is undefined", () => {
        expect(isFirstTotalHeaderAttributeCell(undefined, "country")).toBe(false);
    });
});
