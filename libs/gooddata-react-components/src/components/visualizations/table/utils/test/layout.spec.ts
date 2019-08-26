// (C) 2019 GoodData Corporation
import {
    calculateArrowPosition,
    getHeaderClassNames,
    getHeaderOffset,
    isHeaderAtDefaultPosition,
    isHeaderAtEdgePosition,
    getHeaderPositions,
    getTooltipAlignPoints,
    getTooltipSortAlignPoints,
    getFooterHeight,
    isFooterAtDefaultPosition,
    isFooterAtEdgePosition,
    getFooterPositions,
} from "../layout";

import { IPositions, ITableDimensions } from "../../../../../interfaces/Table";

import { ALIGN_LEFT, ALIGN_RIGHT } from "../../constants/align";
import { TABLE_HEADERS_2A_3M } from "../../fixtures/2attributes3measures";
import { TOTALS_DEFINITION_3 } from "../fixtures/totalsWithData";
import { ITotalWithData } from "../../../../../interfaces/Totals";
import "jest";

const ATTRIBUTE_HEADER = TABLE_HEADERS_2A_3M[0];

function mockGetBoundingClientRect(): ClientRect {
    return {
        left: 15,
        right: 800,
        bottom: 0,
        top: 0,
        height: 0,
        width: 0,
    };
}
describe("Layout", () => {
    describe("Footer", () => {
        describe("getFooterHeight", () => {
            const twoTotals: ITotalWithData[] = [
                { type: "sum", outputMeasureIndexes: [], values: [] },
                { type: "avg", outputMeasureIndexes: [], values: [] },
            ];

            describe("edit allowed and totals visible", () => {
                it("should return sum of aggregation rows and height of the row for adding aggregations", () => {
                    const editAllowed: boolean = true;
                    const totalsAreVisible: boolean = true;
                    expect(getFooterHeight(twoTotals, editAllowed, totalsAreVisible)).toEqual(2 * 30 + 50);
                });
            });

            describe("edit not allowed and totals visible", () => {
                it("should return sum of aggregation rows", () => {
                    const editAllowed: boolean = false;
                    const totalsAreVisible: boolean = true;
                    expect(getFooterHeight(twoTotals, editAllowed, totalsAreVisible)).toEqual(2 * 30);
                });
            });

            describe("edit not allowed and totals not visible", () => {
                it("should return sum of aggregation rows", () => {
                    const editAllowed: boolean = false;
                    const totalsAreVisible: boolean = false;
                    expect(getFooterHeight(twoTotals, editAllowed, totalsAreVisible)).toEqual(0);
                });
            });

            describe("edit allowed and totals visible, empty totals", () => {
                it("should return height of the row for adding aggregations", () => {
                    const editAllowed: boolean = true;
                    const totalsAreVisible: boolean = true;
                    const emptyTotals: ITotalWithData[] = [];
                    expect(getFooterHeight(emptyTotals, editAllowed, totalsAreVisible)).toEqual(50);
                });
            });
        });

        describe("isFooterAtDefaultPosition", () => {
            const windowHeight: number = 500;

            it("should return true if footer is scrolled above the bottom of the viewport", () => {
                const tableBottom: number = 250;
                const hasHiddenRows: boolean = false;
                expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight)).toEqual(true);
            });

            it(
                "should return true if footer is scrolled near the bottom of the viewport " +
                    "and table contains hidden rows",
                () => {
                    const tableBottom: number = 510;
                    const hasHiddenRows: boolean = true;
                    expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight)).toEqual(true);
                },
            );

            it(
                "should return false if footer is scrolled near the bottom of the viewport " +
                    "and table has no hidden rows",
                () => {
                    const tableBottom: number = 510;
                    const hasHiddenRows: boolean = false;
                    expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight)).toEqual(
                        false,
                    );
                },
            );

            it("should return false if footer is scrolled below the bottom of the viewport", () => {
                const tableBottom: number = 750;
                const hasHiddenRows: boolean = false;
                expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight)).toEqual(false);
            });
        });

        describe("isFooterAtEdgePosition", () => {
            const totals: ITotalWithData[] = TOTALS_DEFINITION_3;
            const hasHiddenRows: boolean = false;
            const windowHeight: number = 500;
            const totalsEditAllowed: boolean = false;
            const totalsAreVisible: boolean = true;

            it("should return true if footer is at its edge position", () => {
                const tableDimensions: ITableDimensions = {
                    height: 500,
                    bottom: 1000,
                };

                const footerAtEdgePosition: boolean = isFooterAtEdgePosition(
                    hasHiddenRows,
                    totals,
                    windowHeight,
                    totalsEditAllowed,
                    totalsAreVisible,
                    tableDimensions,
                );

                expect(footerAtEdgePosition).toBe(true);
            });

            it("should return false if footer is not at its edge position", () => {
                const tableDimensions: ITableDimensions = {
                    height: 500,
                    bottom: 100,
                };

                const footerAtEdgePosition: boolean = isFooterAtEdgePosition(
                    hasHiddenRows,
                    totals,
                    windowHeight,
                    totalsEditAllowed,
                    totalsAreVisible,
                    tableDimensions,
                );

                expect(footerAtEdgePosition).toBe(false);
            });
        });

        describe("getFooterPositions", () => {
            it("should return proper footer positions", () => {
                const totals: ITotalWithData[] = TOTALS_DEFINITION_3;
                let hasHiddenRows: boolean = true;
                let tableDimensions: ITableDimensions = {
                    height: 300,
                    bottom: 500,
                };
                let windowHeight: number = 400;
                let totalsEditAllowed: boolean = false;
                let totalsAreVisible: boolean = true;

                let footerPositions: IPositions = getFooterPositions(
                    hasHiddenRows,
                    totals,
                    windowHeight,
                    totalsEditAllowed,
                    totalsAreVisible,
                    tableDimensions,
                );

                expect(footerPositions).toEqual({
                    absoluteTop: -100,
                    defaultTop: -15,
                    edgeTop: -139,
                    fixedTop: 100,
                });

                tableDimensions = {
                    height: 500,
                    bottom: 1000,
                };
                windowHeight = 800;

                footerPositions = getFooterPositions(
                    hasHiddenRows,
                    totals,
                    windowHeight,
                    totalsEditAllowed,
                    totalsAreVisible,
                    tableDimensions,
                );
                expect(footerPositions).toEqual({
                    absoluteTop: -200,
                    defaultTop: -15,
                    edgeTop: -339,
                    fixedTop: 300,
                });

                totalsEditAllowed = true;

                footerPositions = getFooterPositions(
                    hasHiddenRows,
                    totals,
                    windowHeight,
                    totalsEditAllowed,
                    totalsAreVisible,
                    tableDimensions,
                );
                expect(footerPositions).toEqual({
                    absoluteTop: -200,
                    defaultTop: -15,
                    edgeTop: -289,
                    fixedTop: 300,
                });

                hasHiddenRows = false;
                tableDimensions = {
                    height: 300,
                    bottom: 100,
                };
                windowHeight = 500;
                totalsEditAllowed = false;

                footerPositions = getFooterPositions(
                    hasHiddenRows,
                    totals,
                    windowHeight,
                    totalsEditAllowed,
                    totalsAreVisible,
                    tableDimensions,
                );
                expect(footerPositions).toEqual({
                    absoluteTop: 400,
                    defaultTop: -0,
                    edgeTop: -154,
                    fixedTop: 200,
                });

                totalsAreVisible = false;

                footerPositions = getFooterPositions(
                    hasHiddenRows,
                    totals,
                    windowHeight,
                    totalsEditAllowed,
                    totalsAreVisible,
                    tableDimensions,
                );
                expect(footerPositions).toEqual({
                    absoluteTop: 400,
                    defaultTop: -0,
                    edgeTop: -244,
                    fixedTop: 200,
                });
            });
        });
    });
    describe("Header", () => {
        describe("calculateArrowPosition", () => {
            it("should get min arrow position", () => {
                expect(
                    calculateArrowPosition({ width: 5, align: ALIGN_LEFT, index: 2 }, 12, {
                        getBoundingClientRect: mockGetBoundingClientRect,
                    }),
                ).toEqual({ left: "3px" });
            });

            it("should get max arrow position", () => {
                expect(
                    calculateArrowPosition({ width: 200, align: ALIGN_LEFT, index: 99 }, 600, {
                        getBoundingClientRect: mockGetBoundingClientRect,
                    }),
                ).toEqual({ left: "772px" });
            });

            it("should calculate arrow position for left aligned column", () => {
                expect(
                    calculateArrowPosition({ width: 50, align: ALIGN_LEFT, index: 3 }, 12, {
                        getBoundingClientRect: mockGetBoundingClientRect,
                    }),
                ).toEqual({ left: "141px" });
            });

            it("should calculate arrow position for right aligned column", () => {
                expect(
                    calculateArrowPosition({ width: 50, align: ALIGN_RIGHT, index: 3 }, 12, {
                        getBoundingClientRect: mockGetBoundingClientRect,
                    }),
                ).toEqual({ left: "175px" });
            });
        });

        describe("getHeaderClassNames", () => {
            it("should get header class names", () => {
                expect(getHeaderClassNames(ATTRIBUTE_HEADER)).toEqual(
                    "gd-table-header-ordering s-id-1st_attr_df_local_identifier",
                );
            });
        });

        describe("getHeaderOffset", () => {
            it("should return proper header offset", () => {
                const hasHiddenRows: boolean = true;
                expect(getHeaderOffset(hasHiddenRows)).toEqual(71);
            });

            it("should return zero header offset when table has no hidden rows", () => {
                const hasHiddenRows: boolean = false;
                expect(getHeaderOffset(hasHiddenRows)).toEqual(56);
            });
        });

        describe("isHeaderAtDefaultPosition", () => {
            it("should return true if header is scrolled below zero sticky header offset", () => {
                const stickyHeaderOffset: number = 0;
                const tableTop: number = 10;
                expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(true);
            });

            it("should return true if header is scrolled exactly at zero sticky header offset", () => {
                const stickyHeaderOffset: number = 0;
                const tableTop: number = 0;
                expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(true);
            });

            it("should return true if header is scrolled exactly at sticky header offset", () => {
                const stickyHeaderOffset: number = 10;
                const tableTop: number = 10;
                expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(true);
            });

            it("should return false if header is scrolled above zero sticky header offset", () => {
                const stickyHeaderOffset: number = 0;
                const tableTop: number = -10;
                expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(false);
            });

            it("should return false if header is scrolled above sticky header offset", () => {
                const stickyHeaderOffset: number = 10;
                const tableTop: number = 8;
                expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(false);
            });
        });

        describe("isHeaderAtEdgePosition", () => {
            const stickyHeaderOffset: number = 0;
            const hasHiddenRows: boolean = true;
            const totals: ITotalWithData[] = [];
            const totalsEditAllowed: boolean = false;
            const totalsAreVisible: boolean = false;

            it("should return true if header is at its edge position", () => {
                const tableBottom: number = 50;

                const headerAtEdgePosition: boolean = isHeaderAtEdgePosition(
                    stickyHeaderOffset,
                    hasHiddenRows,
                    totals,
                    tableBottom,
                    totalsEditAllowed,
                    totalsAreVisible,
                );

                expect(headerAtEdgePosition).toBe(true);
            });

            it("should return false if header is not at its edge position", () => {
                const tableBottom: number = 500;
                const headerAtEdgePosition: boolean = isHeaderAtEdgePosition(
                    stickyHeaderOffset,
                    hasHiddenRows,
                    totals,
                    tableBottom,
                    totalsEditAllowed,
                    totalsAreVisible,
                );

                expect(headerAtEdgePosition).toBe(false);
            });
        });

        describe("getHeaderPositions", () => {
            it("should return proper header positions", () => {
                const stickyHeaderOffset: number = 0;
                let hasHiddenRows: boolean = true;
                let totals: ITotalWithData[] = [];
                let totalsEditAllowed: boolean = false;
                let totalsVisible: boolean = false;
                let tableDimensions: ITableDimensions = {
                    height: 500,
                    top: 50,
                };
                let headerPositions: IPositions = getHeaderPositions(
                    stickyHeaderOffset,
                    hasHiddenRows,
                    totals,
                    totalsEditAllowed,
                    totalsVisible,
                    tableDimensions,
                );

                expect(headerPositions).toEqual({
                    absoluteTop: -50,
                    defaultTop: 0,
                    edgeTop: 414,
                    fixedTop: 0,
                });

                hasHiddenRows = true;
                totals = TOTALS_DEFINITION_3;
                tableDimensions = {
                    height: 500,
                    top: 50,
                };
                totalsVisible = true;

                headerPositions = getHeaderPositions(
                    stickyHeaderOffset,
                    hasHiddenRows,
                    totals,
                    totalsEditAllowed,
                    totalsVisible,
                    tableDimensions,
                );
                expect(headerPositions).toEqual({
                    absoluteTop: -50,
                    defaultTop: 0,
                    edgeTop: 324,
                    fixedTop: 0,
                });

                hasHiddenRows = false;
                totals = TOTALS_DEFINITION_3;

                headerPositions = getHeaderPositions(
                    stickyHeaderOffset,
                    hasHiddenRows,
                    totals,
                    totalsEditAllowed,
                    totalsVisible,
                    tableDimensions,
                );
                expect(headerPositions).toEqual({
                    absoluteTop: -50,
                    defaultTop: 0,
                    edgeTop: 354,
                    fixedTop: 0,
                });

                totalsEditAllowed = true;
                headerPositions = getHeaderPositions(
                    stickyHeaderOffset,
                    hasHiddenRows,
                    totals,
                    totalsEditAllowed,
                    totalsVisible,
                    tableDimensions,
                );
                expect(headerPositions).toEqual({
                    absoluteTop: -50,
                    defaultTop: 0,
                    edgeTop: 304,
                    fixedTop: 0,
                });

                totalsEditAllowed = false;
                hasHiddenRows = true;
                totals = [];
                tableDimensions = {
                    height: 200,
                    top: 100,
                };

                headerPositions = getHeaderPositions(
                    stickyHeaderOffset,
                    hasHiddenRows,
                    totals,
                    totalsEditAllowed,
                    totalsVisible,
                    tableDimensions,
                );
                expect(headerPositions).toEqual({
                    absoluteTop: -100,
                    defaultTop: 0,
                    edgeTop: 114,
                    fixedTop: 0,
                });

                hasHiddenRows = false;
                totals = [];

                headerPositions = getHeaderPositions(
                    stickyHeaderOffset,
                    hasHiddenRows,
                    totals,
                    totalsEditAllowed,
                    totalsVisible,
                    tableDimensions,
                );
                expect(headerPositions).toEqual({
                    absoluteTop: -100,
                    defaultTop: 0,
                    edgeTop: 144,
                    fixedTop: 0,
                });
            });
        });

        describe("getTooltipAlignPoints", () => {
            it("should get tooltip align points for left aligned column", () => {
                expect(getTooltipAlignPoints(ALIGN_LEFT)).toEqual([
                    {
                        align: "bl tl",
                        offset: { x: 8, y: 0 },
                    },
                    {
                        align: "bl tc",
                        offset: { x: 8, y: 0 },
                    },
                    {
                        align: "bl tr",
                        offset: { x: 8, y: 0 },
                    },
                ]);
            });

            it("should get tooltip align points for right aligned column", () => {
                expect(getTooltipAlignPoints(ALIGN_RIGHT)).toEqual([
                    {
                        align: "br tr",
                        offset: { x: -8, y: 0 },
                    },
                    {
                        align: "br tc",
                        offset: { x: -8, y: 0 },
                    },
                    {
                        align: "br tl",
                        offset: { x: -8, y: 0 },
                    },
                ]);
            });
        });

        describe("getTooltipSortAlignPoints", () => {
            it("should get tooltip sort align points for left aligned column", () => {
                expect(getTooltipSortAlignPoints(ALIGN_LEFT)).toEqual([
                    {
                        align: "bl tl",
                        offset: { x: 8, y: -8 },
                    },
                    {
                        align: "bl tc",
                        offset: { x: 8, y: -8 },
                    },
                    {
                        align: "bl tr",
                        offset: { x: 8, y: -8 },
                    },
                    {
                        align: "br tl",
                        offset: { x: -8, y: -8 },
                    },
                    {
                        align: "tl bl",
                        offset: { x: 8, y: 8 },
                    },
                    {
                        align: "tl bc",
                        offset: { x: 8, y: 8 },
                    },
                    {
                        align: "tl br",
                        offset: { x: 8, y: 8 },
                    },
                    {
                        align: "tr bl",
                        offset: { x: -8, y: 8 },
                    },
                ]);
            });

            it("should get tooltip sort align points for right aligned column", () => {
                expect(getTooltipSortAlignPoints(ALIGN_RIGHT)).toEqual([
                    {
                        align: "br tr",
                        offset: { x: -8, y: -8 },
                    },
                    {
                        align: "br tc",
                        offset: { x: -8, y: -8 },
                    },
                    {
                        align: "br tl",
                        offset: { x: -8, y: -8 },
                    },
                    {
                        align: "bl tr",
                        offset: { x: 8, y: -8 },
                    },
                    {
                        align: "tr br",
                        offset: { x: -8, y: 8 },
                    },
                    {
                        align: "tr bc",
                        offset: { x: -8, y: 8 },
                    },
                    {
                        align: "tr bl",
                        offset: { x: -8, y: 8 },
                    },
                    {
                        align: "tl br",
                        offset: { x: 8, y: 8 },
                    },
                ]);
            });
        });
    });
});
