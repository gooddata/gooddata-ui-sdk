// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDimension } from "@gooddata/sdk-model";

import { areTotalsChanged, getSubtotalStyles, isInvalidGetRowsRequest } from "../dataSourceUtils.js";
import { type IGridTotalsRow } from "../resultTypes.js";

describe("getGridDataSourceUtils", () => {
    describe("isInvalidGetRowsRequest", () => {
        function mockGridApi(displayedRowCount: number | null): any {
            return {
                getDisplayedRowCount: () => displayedRowCount,
            };
        }

        it("should return false when gridApi is undefined", () => {
            const startRow = 0;
            const gridApi = undefined;

            expect(isInvalidGetRowsRequest(startRow, gridApi)).toEqual(false);
        });

        it("should return false is start row of request is below bottom row index", () => {
            const startRow = 0;
            // bottomRowIndex = displayedRowCount - 1 = 2 - 1 = 1
            const displayedRowCount = 2;
            const gridApi = mockGridApi(displayedRowCount);

            expect(isInvalidGetRowsRequest(startRow, gridApi)).toEqual(false);
        });

        it("should return true is start row of request is above bottom row index", () => {
            const startRow = 1;
            // bottomRowIndex = displayedRowCount - 1 = 1 - 1 = 0
            const displayedRowCount = 1;
            const gridApi = mockGridApi(displayedRowCount);

            expect(isInvalidGetRowsRequest(startRow, gridApi)).toEqual(true);
        });
    });

    describe("areTotalsChanged", () => {
        function mockGridApi(totals: any[] = []): any {
            return {
                getPinnedBottomRowCount: () => totals.length,
                getPinnedBottomRow: (i: number) => ({ data: totals[i] }),
            };
        }
        const totalSum = {
            type: "rowTotal",
            colSpan: {
                count: 1,
                headerKey: "foo",
            },
        };
        const emptyTotalRows: IGridTotalsRow[] = [];
        const noTotalRows: IGridTotalsRow[] | null = null;
        const oneTotalRows: IGridTotalsRow[] = [totalSum];

        it.each([
            [true, "no", "one", noTotalRows, [totalSum]],
            [false, "no", "no", noTotalRows, []],
            [true, "empty", "one", emptyTotalRows, [totalSum]],
            [false, "empty", "no", emptyTotalRows, []],
            [true, "one", "no", oneTotalRows, []],
            [false, "one", "one", oneTotalRows, [totalSum]],
        ])(
            "should return %s when %s total passed and %s total present in bottom pinned row",
            (
                expectedValue: boolean,
                _passed: string,
                _table: string,
                passedTotals: any[] | null,
                tableTotals: any[],
            ) => {
                const gridApi = mockGridApi(tableTotals);

                expect(areTotalsChanged(gridApi, passedTotals as [])).toBe(expectedValue);
            },
        );
    });

    describe("getSubtotalStyles", () => {
        it("should return empty array if no totals are present", () => {
            const dimension: IDimension = {
                itemIdentifiers: ["a1", "a2", "a3"],
            };
            const resultSubtotalStyles = getSubtotalStyles(dimension);
            expect(resultSubtotalStyles).toEqual([]);
        });
        it("should return null on first attribute", () => {
            const dimension: IDimension = {
                itemIdentifiers: ["a1", "a2"],
                totals: [
                    {
                        attributeIdentifier: "a1",
                        type: "sum",
                        measureIdentifier: "m1",
                    },
                    {
                        attributeIdentifier: "a2",
                        type: "sum",
                        measureIdentifier: "m1",
                    },
                ],
            };
            const resultSubtotalStyles = getSubtotalStyles(dimension);
            expect(resultSubtotalStyles).toEqual([null, "even"]);
        });
        it("should alternate subtotal style", () => {
            const dimension: IDimension = {
                itemIdentifiers: ["a1", "a2", "a3", "a4", "a5"],
                totals: [
                    {
                        attributeIdentifier: "a2",
                        type: "sum",
                        measureIdentifier: "m1",
                    },
                    {
                        attributeIdentifier: "a4",
                        type: "sum",
                        measureIdentifier: "m1",
                    },
                    {
                        attributeIdentifier: "a5",
                        type: "sum",
                        measureIdentifier: "m1",
                    },
                ],
            };
            const resultSubtotalStyles = getSubtotalStyles(dimension);
            expect(resultSubtotalStyles).toEqual([null, "even", null, "odd", "even"]);
        });
    });
});
