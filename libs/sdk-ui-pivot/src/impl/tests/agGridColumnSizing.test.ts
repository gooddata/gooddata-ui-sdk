// (C) 2007-2020 GoodData Corporation
import {
    convertColumnWidthsToMap,
    getColumnWidthsFromMap,
    getWeakColumnWidthsFromMap,
    IResizedColumnsCollection,
    IWeakMeasureColumnWidthItemsMap,
    MANUALLY_SIZED_MAX_WIDTH,
    resetColumnsWidthToDefault,
    ResizedColumnsStore,
    resizeWeakMeasureColumns,
    syncSuppressSizeToFitOnColumns,
    updateColumnDefinitionsWithWidths,
    getMaxWidth,
    getMaxWidthCached,
    SORT_ICON_WIDTH,
    getUpdatedColumnDefs,
    MIN_WIDTH as AG_GRID_COLUMN_SIZING_MIN_WIDTH,
} from "../agGridColumnSizing";
import { IGridHeader } from "../agGridTypes";
import { ColumnWidthItem, IAbsoluteColumnWidth, IResizedColumns } from "../../columnWidths";
import { DEFAULT_COLUMN_WIDTH } from "../../CorePivotTable";
import { recordedDataFacade } from "../../../__mocks__/recordings";
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import { createTableHeaders } from "../agGridHeaders";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { attributeLocalId, measureLocalId } from "@gooddata/sdk-model";
import { COLUMN_ATTRIBUTE_COLUMN, MEASURE_COLUMN, ROW_ATTRIBUTE_COLUMN } from "../agGridConst";
import { getFakeColumn, getFakeColumnApi } from "./agGridMock";

const ColumnOnlyResult = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleColumn,
    DataViewFirstPage,
);
const TwoMeasuresWithRowAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithRowAttribute,
    DataViewFirstPage,
);

describe("agGridColumnSizing", () => {
    const columnWidths: ColumnWidthItem[] = [
        {
            measureColumnWidthItem: {
                width: { value: 60 },
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
                width: { value: 400 },
                attributeIdentifier: attributeLocalId(ReferenceLdm.Product.Name),
            },
        },
    ];

    const MIN_WIDTH = 100;
    const MAX_WIDTH = 300;

    const widthValidator = (width: IAbsoluteColumnWidth): IAbsoluteColumnWidth => {
        if (Number(width.value) === width.value) {
            return {
                ...width,
                value: Math.min(Math.max(width.value, MIN_WIDTH), MAX_WIDTH),
            };
        }
        return width;
    };

    const expectedColumnMap = {
        m_0: {
            width: {
                value: 60,
            },
            measureIdentifier: measureLocalId(ReferenceLdm.Amount),
        },
        a_1055: {
            width: {
                value: 400,
            },
        },
    };

    const expectedColumnMapValidated = {
        m_0: {
            width: {
                value: MIN_WIDTH,
            },
            measureIdentifier: measureLocalId(ReferenceLdm.Amount),
        },
        a_1055: {
            width: {
                value: MAX_WIDTH,
            },
        },
    };

    describe("convertColumnWidthsToMap", () => {
        it("should return correct IResizedColumns map", async () => {
            const result = convertColumnWidthsToMap(columnWidths, TwoMeasuresWithRowAttribute);
            expect(result).toEqual(expectedColumnMap);
        });

        it("should return correct IResizedColumns map and validate range of widths", async () => {
            const result = convertColumnWidthsToMap(
                columnWidths,
                TwoMeasuresWithRowAttribute,
                widthValidator,
            );
            expect(result).toEqual(expectedColumnMapValidated);
        });

        it("should return correct IResizedColumnsCollection map for measureColumnWidthItem with missing IMeasureLocatorItem", async () => {
            const noMeasureColumnWidths: ColumnWidthItem[] = [
                {
                    measureColumnWidthItem: {
                        width: {
                            value: 155,
                        },
                        locators: [
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: attributeLocalId(ReferenceLdm.Product.Name),
                                    element:
                                        "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1054/elements?id=165678",
                                },
                            },
                        ],
                    },
                },
            ];

            const expectedResult: IResizedColumnsCollection = {
                a_1054_165678: { width: { value: 155 } },
            };

            const result = convertColumnWidthsToMap(noMeasureColumnWidths, ColumnOnlyResult, widthValidator);
            expect(result).toEqual(expectedResult);
        });
    });

    describe("getColumnWidthsFromMap", () => {
        it("should return correct ColumnWidthItem array", async () => {
            const result = getColumnWidthsFromMap(expectedColumnMap, TwoMeasuresWithRowAttribute);
            expect(result).toEqual(columnWidths);
        });

        it("should return correct ColumnWidthItem array for only column attribute", async () => {
            const columnAttributeColumnMap = {
                a_1054_1: {
                    width: {
                        value: 400,
                    },
                },
            };

            const result = getColumnWidthsFromMap(columnAttributeColumnMap, ColumnOnlyResult);
            expect(result).toMatchSnapshot();
        });
    });

    describe("getWeakColumnWidthsFromMap", () => {
        const weakColumnWidthsMap: IWeakMeasureColumnWidthItemsMap = {
            m1: {
                measureColumnWidthItem: {
                    width: { value: 250 },
                    locator: {
                        measureLocatorItem: {
                            measureIdentifier: "m1",
                        },
                    },
                },
            },
            m2: {
                measureColumnWidthItem: {
                    width: { value: 350 },
                    locator: {
                        measureLocatorItem: {
                            measureIdentifier: "m2",
                        },
                    },
                },
            },
        };

        const expectedColumnWidths: ColumnWidthItem[] = [
            {
                measureColumnWidthItem: {
                    width: { value: 250 },
                    locator: {
                        measureLocatorItem: {
                            measureIdentifier: "m1",
                        },
                    },
                },
            },
            {
                measureColumnWidthItem: {
                    width: { value: 350 },
                    locator: {
                        measureLocatorItem: {
                            measureIdentifier: "m2",
                        },
                    },
                },
            },
        ];
        it("should return columnWidths array", () => {
            expect(getWeakColumnWidthsFromMap(weakColumnWidthsMap)).toEqual(expectedColumnWidths);
        });
    });

    describe("updateColumnDefinitionsWithWidths", () => {
        const coloursId = "a_1055";
        const firstMeasureId = "m_0";
        const secondMeasureId = "m_1";

        const coloursManualWidth = 400;
        const amountManualWidth = 100;

        const columDefAmount = {
            suppressSizeToFit: false,
            width: amountManualWidth,
            colId: "m_0",
            type: MEASURE_COLUMN,
        };
        const columDefColours = {
            suppressSizeToFit: false,
            width: coloursManualWidth,
            colId: coloursId,
            type: COLUMN_ATTRIBUTE_COLUMN,
        };

        const manuallyResizedColumns = new ResizedColumnsStore();
        manuallyResizedColumns.addToManuallyResizedColumn(getFakeColumn(columDefAmount));
        manuallyResizedColumns.addToManuallyResizedColumn(getFakeColumn(columDefColours));

        const coloursAutoWidth = 76;
        const amountAutoWidth = 77;
        const biggerAmountAutoWidth = 116;

        const autoResizeColumns: IResizedColumns = {
            [firstMeasureId]: {
                width: amountAutoWidth,
            },
            [coloursId]: {
                width: coloursAutoWidth,
            },
            [secondMeasureId]: {
                width: biggerAmountAutoWidth,
            },
        };

        const coloursGrowToFitWidth = 400;
        const amountGrowToFitWidth = 400;
        const biggerAmountGrowToFitWidth = 400;

        const growToFitResizeColumns: IResizedColumns = {
            [firstMeasureId]: {
                width: amountGrowToFitWidth,
            },
            [coloursId]: {
                width: coloursGrowToFitWidth,
            },
            [secondMeasureId]: {
                width: biggerAmountGrowToFitWidth,
            },
        };

        const overLimitWidth = MANUALLY_SIZED_MAX_WIDTH + 100;

        const getGrowToFitResizeColumnsOverLimit = () => {
            return {
                ...growToFitResizeColumns,
                [firstMeasureId]: { width: overLimitWidth },
            };
        };
        describe("manually resized", () => {
            it("should correctly enrich columns definition by manually resized columns, auto resize map is empty and growToFit off", async () => {
                const columnDefinitions: IGridHeader[] = createTableHeaders(
                    TwoMeasuresWithRowAttribute.dataView,
                ).allHeaders;
                updateColumnDefinitionsWithWidths(
                    columnDefinitions,
                    manuallyResizedColumns,
                    {},
                    DEFAULT_COLUMN_WIDTH,
                    false,
                    {},
                );

                expect(columnDefinitions).toMatchSnapshot();
            });

            it("should correctly enrich columns definition by manually and auto resized columns and growToFit off", async () => {
                const columnDefinitions: IGridHeader[] = createTableHeaders(
                    TwoMeasuresWithRowAttribute.dataView,
                ).allHeaders;
                updateColumnDefinitionsWithWidths(
                    columnDefinitions,
                    manuallyResizedColumns,
                    autoResizeColumns,
                    DEFAULT_COLUMN_WIDTH,
                    false,
                    {},
                );

                expect(columnDefinitions).toMatchSnapshot();
            });

            it("should correctly enrich columns definition by manually and auto resized columns and growToFit on", async () => {
                const columnDefinitions: IGridHeader[] = createTableHeaders(
                    TwoMeasuresWithRowAttribute.dataView,
                ).allHeaders;
                updateColumnDefinitionsWithWidths(
                    columnDefinitions,
                    manuallyResizedColumns,
                    autoResizeColumns,
                    DEFAULT_COLUMN_WIDTH,
                    true,
                    growToFitResizeColumns,
                );

                expect(columnDefinitions).toMatchSnapshot();
            });
        });

        describe("auto resized", () => {
            it("should correctly enrich columns definition by auto resized columns, manual resize map is empty and growToFit off", async () => {
                const columnDefinitions: IGridHeader[] = createTableHeaders(
                    TwoMeasuresWithRowAttribute.dataView,
                ).allHeaders;
                updateColumnDefinitionsWithWidths(
                    columnDefinitions,
                    new ResizedColumnsStore(),
                    autoResizeColumns,
                    DEFAULT_COLUMN_WIDTH,
                    false,
                    {},
                );

                expect(columnDefinitions).toMatchSnapshot();
            });

            it("should correctly enrich columns definition by auto resized columns, manual resize map is empty and growToFit on", async () => {
                const columnDefinitions: IGridHeader[] = createTableHeaders(
                    TwoMeasuresWithRowAttribute.dataView,
                ).allHeaders;
                updateColumnDefinitionsWithWidths(
                    columnDefinitions,
                    new ResizedColumnsStore(),
                    autoResizeColumns,
                    DEFAULT_COLUMN_WIDTH,
                    true,
                    growToFitResizeColumns,
                );

                expect(columnDefinitions).toMatchSnapshot();
            });
        });

        describe("growToFit", () => {
            it("should correctly enrich columns definition, manual resize map is empty by auto resized columns map is and growToFit on", async () => {
                const columnDefinitions: IGridHeader[] = createTableHeaders(
                    TwoMeasuresWithRowAttribute.dataView,
                ).allHeaders;
                updateColumnDefinitionsWithWidths(
                    columnDefinitions,
                    new ResizedColumnsStore(),
                    {},
                    DEFAULT_COLUMN_WIDTH,
                    true,
                    growToFitResizeColumns,
                );

                expect(columnDefinitions).toMatchSnapshot();
            });

            it("should set maxWidth to undefined when growToFit width si bigger than MANUALLY_SIZED_MAX_WIDTH", async () => {
                const columnDefinitions: IGridHeader[] = createTableHeaders(
                    TwoMeasuresWithRowAttribute.dataView,
                ).allHeaders;
                updateColumnDefinitionsWithWidths(
                    columnDefinitions,
                    new ResizedColumnsStore(),
                    {},
                    DEFAULT_COLUMN_WIDTH,
                    true,
                    getGrowToFitResizeColumnsOverLimit(),
                );

                expect(columnDefinitions).toMatchSnapshot();
            });
        });

        describe("no column sizing", () => {
            it("should get column definitions with default width", async () => {
                const columnDefinitions: IGridHeader[] = createTableHeaders(
                    TwoMeasuresWithRowAttribute.dataView,
                ).allHeaders;
                updateColumnDefinitionsWithWidths(
                    columnDefinitions,
                    new ResizedColumnsStore(),
                    {},
                    DEFAULT_COLUMN_WIDTH,
                    false,
                    getGrowToFitResizeColumnsOverLimit(),
                );

                expect(columnDefinitions).toMatchSnapshot();
            });
        });
    });

    const colId1 = "colId1";
    const colId2 = "colId2";
    const colId3 = "colId3";
    const colId4 = "colId4";

    describe("syncSuppressSizeToFitOnColumns", () => {
        it("should set correctly suppressSizeToFit for columns ", () => {
            const columnDef1 = { suppressSizeToFit: true, width: 100, colId: colId1, type: MEASURE_COLUMN };
            const columnDef2 = { suppressSizeToFit: true, width: 200, colId: colId2, type: MEASURE_COLUMN };
            const columnDef3 = { suppressSizeToFit: false, width: 200, colId: colId3, type: MEASURE_COLUMN };

            const columnsMaps = {
                colId1: getFakeColumn(columnDef1),
                colId2: getFakeColumn(columnDef2),
                colId3: getFakeColumn(columnDef3),
            };

            const columnApi = getFakeColumnApi(columnsMaps);

            const manuallyResizedColumns = new ResizedColumnsStore();
            manuallyResizedColumns.addToManuallyResizedColumn(columnsMaps.colId2);
            manuallyResizedColumns.addToManuallyResizedColumn(columnsMaps.colId3);

            syncSuppressSizeToFitOnColumns(manuallyResizedColumns, columnApi);

            expect(columnApi.getColumn(colId1).getColDef().suppressSizeToFit).toEqual(false);

            expect(columnApi.getColumn(colId2).getColDef().suppressSizeToFit).toEqual(true);

            expect(columnApi.getColumn(colId3).getColDef().suppressSizeToFit).toEqual(true);
        });
    });

    describe("resetColumnsWidthToDefault", () => {
        it("should set correctly widths for columns: manual>auto>default", () => {
            const columnDef1 = { suppressSizeToFit: true, width: 100, colId: colId1, type: MEASURE_COLUMN };
            const columnDef2 = { suppressSizeToFit: true, width: 200, colId: colId2, type: MEASURE_COLUMN };
            const columnDef3 = { suppressSizeToFit: false, width: 200, colId: colId3, type: MEASURE_COLUMN };

            const columnsMaps = {
                colId1: getFakeColumn(columnDef1),
                colId2: getFakeColumn(columnDef2),
                colId3: getFakeColumn(columnDef3),
            };

            const columnApi = getFakeColumnApi(columnsMaps);

            const manuallyResizedColumns = new ResizedColumnsStore();
            manuallyResizedColumns.addToManuallyResizedColumn(
                getFakeColumn({ suppressSizeToFit: true, width: 300, colId: colId1, type: MEASURE_COLUMN }),
            );

            const autoWidths = {
                colId1: {
                    width: 150,
                },
                colId2: {
                    width: 400,
                },
            };
            const defaultWidth = 250;

            resetColumnsWidthToDefault(
                columnApi,
                columnApi.getAllColumns(),
                manuallyResizedColumns,
                autoWidths,
                defaultWidth,
            );

            expect(columnApi.getAllColumns()[0].getActualWidth()).toEqual(300);

            expect(columnApi.getAllColumns()[1].getActualWidth()).toEqual(400);

            expect(columnApi.getAllColumns()[2].getActualWidth()).toEqual(250);
        });
    });

    describe("resizeWeakMeasureColumns", () => {
        const drillItems = [
            {
                measureHeaderItem: {
                    localIdentifier: "m1",
                    name: "Amount",
                    format: "#.##x",
                },
            },
        ];

        const columnDef1 = {
            suppressSizeToFit: true,
            width: 100,
            colId: colId1,
            type: MEASURE_COLUMN,
            drillItems,
        };
        const columnDef2 = { suppressSizeToFit: true, width: 200, colId: colId2, type: MEASURE_COLUMN };
        const columnDef3 = {
            suppressSizeToFit: false,
            width: 200,
            colId: colId3,
            type: MEASURE_COLUMN,
            drillItems,
        };
        const columnDef4 = {
            suppressSizeToFit: false,
            width: 222,
            colId: colId4,
            type: ROW_ATTRIBUTE_COLUMN,
        };

        const resizedColumnDef = {
            suppressSizeToFit: false,
            width: 333,
            colId: colId1,
            type: MEASURE_COLUMN,
            drillItems,
        };

        it("should resize all matching measure columns to the size of resized measure column", () => {
            const columnsMaps = {
                colId1: getFakeColumn(columnDef1),
                colId2: getFakeColumn(columnDef2),
                colId3: getFakeColumn(columnDef3),
                colId4: getFakeColumn(columnDef4),
            };
            const columnApi = getFakeColumnApi(columnsMaps);
            resizeWeakMeasureColumns(columnApi, new ResizedColumnsStore(), getFakeColumn(resizedColumnDef));
            expect(columnApi.getAllColumns().map((column) => column.getActualWidth())).toEqual([
                333,
                200,
                333,
                222,
            ]);
        });

        it("should ignore resize of attribute column", () => {
            const columnsMaps = {
                colId1: getFakeColumn(columnDef1),
                colId2: getFakeColumn(columnDef2),
                colId3: getFakeColumn(columnDef3),
                colId4: getFakeColumn(columnDef4),
            };
            const columnApi = getFakeColumnApi(columnsMaps);
            const resizedAttrColumnDef = {
                suppressSizeToFit: false,
                width: 333,
                colId: colId1,
                type: ROW_ATTRIBUTE_COLUMN,
                drillItems,
            };

            resizeWeakMeasureColumns(
                columnApi,
                new ResizedColumnsStore(),
                getFakeColumn(resizedAttrColumnDef),
            );
            expect(columnApi.getAllColumns().map((column) => column.getActualWidth())).toEqual([
                100,
                200,
                200,
                222,
            ]);
        });
    });

    describe("getMaxWidth", () => {
        const width = 20;
        const measureTextMock = jest.fn();
        const context: any = {
            measureText: measureTextMock.mockReturnValue({ width }),
        };

        it("should return correct new max width when sort is set to true", () => {
            const correctWidth = width + SORT_ICON_WIDTH;
            expect(getMaxWidth(context, "text", true, 15)).toBe(correctWidth);
        });

        it("should return correct new max width when sort is set to false", () => {
            const correctWidth = width;
            expect(getMaxWidth(context, "text", false, 15)).toBe(correctWidth);
        });

        it("should return undefined when maxWidth is bigger than the measured width", () => {
            const maxWidth = 100;
            expect(getMaxWidth(context, "text", true, maxWidth)).toBeUndefined();
        });
    });

    describe("getMaxWidthCached", () => {
        const width = 20;
        const measureTextMock = jest.fn();
        const context: any = {
            measureText: measureTextMock.mockReturnValue({ width }),
        };
        const widthsCache: Map<string, number> = new Map();

        it("should return correct width from cache", () => {
            const correctWidth = width;
            widthsCache.set("text", correctWidth);
            expect(getMaxWidthCached(context, "text", 15, widthsCache)).toBe(correctWidth);
        });

        it("should return correct width when string is not in cache", () => {
            const correctWidth = width;
            widthsCache.set("text", 100);
            expect(getMaxWidthCached(context, "new_text", 15, widthsCache)).toBe(correctWidth);
        });

        it("should return undefined when maxWidth is bigger than the measured width", () => {
            const maxWidth = 100;
            widthsCache.set("text", 20);
            expect(getMaxWidthCached(context, "text", maxWidth, widthsCache)).toBeUndefined();
        });
    });

    describe("getUpdatedColumnDefs", () => {
        const column1 = {
            getColDef: jest.fn().mockReturnValue({ field: "text1" }),
        };
        const column2 = {
            getColDef: jest.fn().mockReturnValue({ field: "text2" }),
        };
        const column3 = {
            getColDef: jest.fn().mockReturnValue({ field: "text3" }),
        };
        const column4 = {
            getColDef: jest.fn().mockReturnValue({ field: "text4" }),
        };
        const columns: any = [column1, column2, column3];
        const padding = 10;

        it("should return correct column definitions with calculated width", () => {
            const width = 100;
            const maxWidths: Map<string, number> = new Map();
            maxWidths.set("text1", width);
            maxWidths.set("text2", width);
            maxWidths.set("text3", width);
            const correctColDefs: any = [
                {
                    field: "text1",
                    width: width + padding,
                },
                {
                    field: "text2",
                    width: width + padding,
                },
                {
                    field: "text3",
                    width: width + padding,
                },
            ];
            expect(getUpdatedColumnDefs(columns, maxWidths, padding)).toStrictEqual(correctColDefs);
        });

        it("should return correct column definitions with calculated width and one column definition with min width", () => {
            const width = 100;
            const maxWidths: Map<string, number> = new Map();
            maxWidths.set("text1", width);
            maxWidths.set("text2", width);
            maxWidths.set("text3", width);
            const newColumns = [...columns, column4];
            const correctColDefs: any = [
                {
                    field: "text1",
                    width: width + padding,
                },
                {
                    field: "text2",
                    width: width + padding,
                },
                {
                    field: "text3",
                    width: width + padding,
                },
                {
                    field: "text4",
                    width: AG_GRID_COLUMN_SIZING_MIN_WIDTH,
                },
            ];
            expect(getUpdatedColumnDefs(newColumns, maxWidths, padding)).toStrictEqual(correctColDefs);
        });
    });
});
