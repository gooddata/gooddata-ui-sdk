// (C) 2020 GoodData Corporation
import { ResizedColumnsStore } from "../ResizedColumnsStore";
import { ColDef, Column } from "@ag-grid-community/all-modules";
import { MEASURE_COLUMN } from "../agGridConst";
import { MANUALLY_SIZED_MAX_WIDTH, MIN_WIDTH } from "../agGridColumnSizing";
import { ColumnWidthItem } from "../../columnWidths";
import { ColumnEventSourceType } from "../../types";
import { recordedDataFacade } from "../../../__mocks__/recordings";
import { ReferenceRecordings, ReferenceLdm } from "@gooddata/reference-workspace";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { attributeLocalId, measureLocalId } from "@gooddata/sdk-model";

const SingleMeasureWithRowAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAttribute,
    DataViewFirstPage,
);

describe("ResizedColumnsStore", () => {
    const columnWidthsMock: ColumnWidthItem[] = [
        {
            measureColumnWidthItem: {
                width: 400,
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: measureLocalId(ReferenceLdm.Amount),
                        },
                    },
                ],
            },
        },
        {
            attributeColumnWidthItem: {
                width: 200,
                attributeIdentifier: attributeLocalId(ReferenceLdm.Product.Name),
            },
        },
    ];
    const columnWidthsAllMeasureMock: ColumnWidthItem[] = [
        {
            measureColumnWidthItem: {
                width: 400,
            },
        },
    ];
    const columnWidthsAllMeasureMockMinWidth: ColumnWidthItem[] = [
        {
            measureColumnWidthItem: {
                width: 10,
            },
        },
    ];
    const columnWidthsAllMeasureMockMaxWidth: ColumnWidthItem[] = [
        {
            measureColumnWidthItem: {
                width: 4000,
            },
        },
    ];

    const getFakeColumn = (columnDefinition: ColDef): Column => {
        const fakeColumn = {
            getColDef: () => {
                return columnDefinition;
            },
            getColId: () => {
                return columnDefinition.colId;
            },
            getActualWidth: () => {
                return columnDefinition.width;
            },
        };

        return fakeColumn as Column;
    };

    describe("getManuallyResizedColumn", () => {
        it("should return correct manually resized measure column", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.manuallyResizedColumns = {
                m_0: { width: 400, source: "uiColumnDragged" },
                a_4DOTdf: { width: 200, source: "uiColumnDragged" },
            };
            const columnMock = getFakeColumn({
                colId: "m_0",
            });
            const expectedResult = { width: 400, source: "uiColumnDragged" };
            const result = resizedColumnsStore.getManuallyResizedColumn(columnMock);
            expect(result).toEqual(expectedResult);
        });

        it("should return all measure column width", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.allMeasureColumnWidth = 42;
            const columnMock = getFakeColumn({
                type: MEASURE_COLUMN,
            });
            const expectedResult = { width: 42, source: "uiColumnDragged" };
            const result = resizedColumnsStore.getManuallyResizedColumn(columnMock);
            expect(result).toEqual(expectedResult);
        });

        it("should return all measure column width when manuallyResizedColumns exists", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.manuallyResizedColumns = {
                m_0: { width: 400, source: "uiColumnDragged" },
                a_4DOTdf: { width: 200, source: "uiColumnDragged" },
            };
            resizedColumnsStore.allMeasureColumnWidth = 42;

            const columnMock = getFakeColumn({
                type: MEASURE_COLUMN,
            });
            const expectedResult = { width: 42, source: "uiColumnDragged" };
            const result = resizedColumnsStore.getManuallyResizedColumn(columnMock);
            expect(result).toEqual(expectedResult);
        });
    });

    describe("isColumnManuallyResized", () => {
        it("should return true for manually resized column", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.manuallyResizedColumns = {
                m_0: { width: 400, source: "uiColumnDragged" },
            };
            const columnMock = getFakeColumn({
                colId: "m_0",
            });
            const result = resizedColumnsStore.isColumnManuallyResized(columnMock);
            expect(result).toBeTruthy();
        });

        it("should return false for column that is not manually resized", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.manuallyResizedColumns = {};
            const columnMock = getFakeColumn({
                colId: "m.without.manually.resizing",
            });
            const result = resizedColumnsStore.isColumnManuallyResized(columnMock);
            expect(result).toBeFalsy();
        });
    });

    describe("addToManuallyResizedColumn", () => {
        it("should add manually resized column to map", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            const correctWidth = 42;
            const columnMock = getFakeColumn({
                colId: "m_1",
                width: correctWidth,
            });
            resizedColumnsStore.addToManuallyResizedColumn(columnMock);
            const result = resizedColumnsStore.manuallyResizedColumns.m_1.width;
            expect(result).toBe(correctWidth);
        });
    });

    describe("addAllMeasureColumns", () => {
        it("should add all measure columns", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            const columnsMock = [
                getFakeColumn({
                    type: MEASURE_COLUMN,
                }),
            ];
            resizedColumnsStore.addAllMeasureColumns(42, columnsMock);
            const expectedResult = 42;
            const result = resizedColumnsStore.allMeasureColumnWidth;
            expect(result).toEqual(expectedResult);
        });

        it("should omit from manually resized map by colId", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.manuallyResizedColumns = {
                m_0: { width: 400, source: "uiColumnDragged" },
            };
            const columnsMock = [
                getFakeColumn({
                    colId: "m_0",
                    type: MEASURE_COLUMN,
                }),
                getFakeColumn({
                    type: MEASURE_COLUMN,
                }),
            ];
            resizedColumnsStore.addAllMeasureColumns(42, columnsMock);
            const result = resizedColumnsStore.manuallyResizedColumns.m_0;
            expect(result).toBeUndefined();
        });

        it("should omit from manually resized map by colId and kept other items", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.manuallyResizedColumns = {
                m_0: { width: 400, source: "uiColumnDragged" },
                a_4DOTdf: { width: 200, source: "uiColumnDragged" },
            };
            const columnsMock = [
                getFakeColumn({
                    colId: "m_0",
                    type: MEASURE_COLUMN,
                }),
                getFakeColumn({
                    type: MEASURE_COLUMN,
                }),
            ];
            resizedColumnsStore.addAllMeasureColumns(42, columnsMock);
            const result = resizedColumnsStore.manuallyResizedColumns.a_4DOTdf.width;
            const correctWidth = 200;
            expect(result).toEqual(correctWidth);
        });
    });

    describe("removeAllMeasureColumns", () => {
        it("should remove all measure columns", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.removeAllMeasureColumns();
            const result = resizedColumnsStore.allMeasureColumnWidth;
            expect(result).toBeNull();
        });

        it("should omit from manually resized columns when width is auto", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.manuallyResizedColumns = {
                m_0: { width: "auto", source: "uiColumnDragged" },
            };
            resizedColumnsStore.removeAllMeasureColumns();
            const result = resizedColumnsStore.manuallyResizedColumns.m_0;
            expect(result).toBeUndefined();
        });

        it("should omit from manually resized columns when width is auto and kept other items", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.manuallyResizedColumns = {
                m_0: { width: "auto", source: "uiColumnDragged" },
                a_4DOTdf: { width: 200, source: "uiColumnDragged" },
            };
            resizedColumnsStore.removeAllMeasureColumns();
            const result = resizedColumnsStore.manuallyResizedColumns.a_4DOTdf.width;
            const correctWidth = 200;
            expect(result).toEqual(correctWidth);
        });
    });

    describe("removeFromManuallyResizedColumn", () => {
        it("should remove from manually resized column map by colId", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.manuallyResizedColumns = {
                m_0: { width: 200, source: "uiColumnDragged" },
                a_4DOTdf: { width: 200, source: "uiColumnDragged" },
            };
            const columnMock = getFakeColumn({
                colId: "m_0",
                type: MEASURE_COLUMN,
            });
            resizedColumnsStore.removeFromManuallyResizedColumn(columnMock);
            const result = resizedColumnsStore.manuallyResizedColumns.m_0;
            expect(result).toBeUndefined();
        });

        it("should set auto width when colId does not exists and all measure is used", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.allMeasureColumnWidth = 200;
            const columnMock = getFakeColumn({
                colId: "m_0",
                type: MEASURE_COLUMN,
            });
            resizedColumnsStore.removeFromManuallyResizedColumn(columnMock);
            const expectedResult = { width: "auto", source: "uiColumnDragged" };
            const result = resizedColumnsStore.manuallyResizedColumns.m_0;
            expect(result).toEqual(expectedResult);
        });

        it("should set auto width when colId does exists and all measure is used", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.allMeasureColumnWidth = 200;
            resizedColumnsStore.manuallyResizedColumns = {
                m_0: { width: 200, source: "uiColumnDragged" },
            };
            const columnMock = getFakeColumn({
                colId: "m_0",
                type: MEASURE_COLUMN,
            });
            resizedColumnsStore.removeFromManuallyResizedColumn(columnMock);
            const expectedResult = { width: "auto", source: "uiColumnDragged" };
            const result = resizedColumnsStore.manuallyResizedColumns.m_0;
            expect(result).toEqual(expectedResult);
        });
    });

    describe("getColumnWidthsFromMap", () => {
        it("should return correct column widths", () => {
            const resizedColumnsStore = new ResizedColumnsStore();
            resizedColumnsStore.updateColumnWidths(columnWidthsMock, SingleMeasureWithRowAttribute);
            const expectedResult = [
                {
                    measureColumnWidthItem: {
                        width: 400,
                        locators: [
                            {
                                measureLocatorItem: {
                                    measureIdentifier: measureLocalId(ReferenceLdm.Amount),
                                },
                            },
                        ],
                    },
                },
                {
                    attributeColumnWidthItem: {
                        width: 200,
                        attributeIdentifier: attributeLocalId(ReferenceLdm.Product.Name),
                    },
                },
            ];
            const result = resizedColumnsStore.getColumnWidthsFromMap(SingleMeasureWithRowAttribute);
            expect(result).toEqual(expectedResult);
        });

        it("should return all measure column width when is used", () => {
            const resizedColumnsStore = new ResizedColumnsStore();
            const columnWidthsWithAllMeasureMock: ColumnWidthItem[] = [
                ...columnWidthsMock,
                ...columnWidthsAllMeasureMock,
            ];
            resizedColumnsStore.updateColumnWidths(
                columnWidthsWithAllMeasureMock,
                SingleMeasureWithRowAttribute,
            );
            const expectedResult = [
                {
                    measureColumnWidthItem: {
                        width: 400,
                        locators: [
                            {
                                measureLocatorItem: {
                                    measureIdentifier: measureLocalId(ReferenceLdm.Amount),
                                },
                            },
                        ],
                    },
                },
                {
                    attributeColumnWidthItem: {
                        width: 200,
                        attributeIdentifier: attributeLocalId(ReferenceLdm.Product.Name),
                    },
                },
                {
                    measureColumnWidthItem: {
                        width: 400,
                    },
                },
            ];
            const result = resizedColumnsStore.getColumnWidthsFromMap(SingleMeasureWithRowAttribute);
            expect(result).toEqual(expectedResult);
        });
    });

    describe("updateColumnWidths", () => {
        it("should update column widths", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            const expectedResult = {
                m_0: { width: 400, source: ColumnEventSourceType.UI_DRAGGED },
                a_1055: { width: 200, source: ColumnEventSourceType.UI_DRAGGED },
            };
            resizedColumnsStore.updateColumnWidths(columnWidthsMock, SingleMeasureWithRowAttribute);
            const result = resizedColumnsStore.manuallyResizedColumns;
            expect(result).toEqual(expectedResult);
        });

        it("should update only measure columns", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            const expectedResult = {
                m_0: { width: 400, source: ColumnEventSourceType.UI_DRAGGED },
            };
            const columnWidthsOnlyMeasureMock = [columnWidthsMock[0]];
            resizedColumnsStore.updateColumnWidths(
                columnWidthsOnlyMeasureMock,
                SingleMeasureWithRowAttribute,
            );
            const result = resizedColumnsStore.manuallyResizedColumns;
            expect(result).toEqual(expectedResult);
        });

        it("should update only attribute measure columns", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            const expectedResult = {
                a_1055: { width: 200, source: ColumnEventSourceType.UI_DRAGGED },
            };
            const columnWidthsOnlyAttributeMock = [columnWidthsMock[1]];
            resizedColumnsStore.updateColumnWidths(
                columnWidthsOnlyAttributeMock,
                SingleMeasureWithRowAttribute,
            );
            const result = resizedColumnsStore.manuallyResizedColumns;
            expect(result).toEqual(expectedResult);
        });

        it("should validate all measure width item with min width", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.updateColumnWidths(
                columnWidthsAllMeasureMockMinWidth,
                SingleMeasureWithRowAttribute,
            );
            const expectedResult = MIN_WIDTH;
            const result = resizedColumnsStore.allMeasureColumnWidth;
            expect(result).toEqual(expectedResult);
        });

        it("should validate all measure width item with max width", () => {
            const resizedColumnsStore: any = new ResizedColumnsStore();
            resizedColumnsStore.updateColumnWidths(
                columnWidthsAllMeasureMockMaxWidth,
                SingleMeasureWithRowAttribute,
            );
            const expectedResult = MANUALLY_SIZED_MAX_WIDTH;
            const result = resizedColumnsStore.allMeasureColumnWidth;
            expect(result).toEqual(expectedResult);
        });
    });
});
