// (C) 2007-2020 GoodData Corporation
import {
    convertColumnWidthsToMap,
    getColumnWidthsFromMap,
    updateColumnDefinitionsWithWidths,
    MANUALLY_SIZED_MAX_WIDTH,
    syncSuppressSizeToFitOnColumns,
    resetColumnsWidthToDefault,
} from "../agGridColumnSizing";
import { IGridHeader } from "../agGridTypes";
import { Column, ColumnApi } from "@ag-grid-community/all-modules";
import { ColumnWidthItem, ColumnWidth } from "../../columnWidths";
import { ColumnEventSourceType, IResizedColumns } from "../../types";
import { DEFAULT_COLUMN_WIDTH } from "../../CorePivotTable";
import { recordedDataFacade } from "../../../__mocks__/recordings";
import { ReferenceRecordings, ReferenceLdm } from "@gooddata/reference-workspace";
import { createTableHeaders } from "../agGridHeaders";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { measureLocalId, attributeLocalId } from "@gooddata/sdk-model";

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
                width: 60,
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
                width: 400,
                attributeIdentifier: attributeLocalId(ReferenceLdm.Product.Name),
            },
        },
    ];

    const MIN_WIDTH = 100;
    const MAX_WIDTH = 300;

    const widthValidator = (width: ColumnWidth): ColumnWidth => {
        if (Number(width) === width) {
            return Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH);
        }
        return width;
    };

    const expectedColumnMap = {
        m_0: {
            width: 60,
            source: ColumnEventSourceType.UI_DRAGGED,
        },
        a_1055: {
            width: 400,
            source: ColumnEventSourceType.UI_DRAGGED,
        },
    };

    const expectedColumnMapValidated = {
        m_0: {
            width: MIN_WIDTH,
            source: ColumnEventSourceType.UI_DRAGGED,
        },
        a_1055: {
            width: MAX_WIDTH,
            source: ColumnEventSourceType.UI_DRAGGED,
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
    });

    describe("getColumnWidthsFromMap", () => {
        it("should return correct ColumnWidthItem array", async () => {
            const result = getColumnWidthsFromMap(expectedColumnMap, TwoMeasuresWithRowAttribute);
            expect(result).toEqual(columnWidths);
        });

        it("should return correct ColumnWidthItem array for only column attribute", async () => {
            const columnAttributeColumnMap = {
                a_1054_1: {
                    width: 400,
                    source: ColumnEventSourceType.UI_DRAGGED,
                },
            };

            const expectedColumnWidths: ColumnWidthItem[] = [
                {
                    measureColumnWidthItem: {
                        width: 400,
                        locators: [
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: "a_label.product.id.name",
                                    element:
                                        "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1054/elements?id=1",
                                },
                            },
                        ],
                    },
                },
            ];

            const result = getColumnWidthsFromMap(columnAttributeColumnMap, ColumnOnlyResult);
            expect(result).toEqual(expectedColumnWidths);
        });
    });

    describe("updateColumnDefinitionsWithWidths", () => {
        const coloursId = "a_1055";
        const firstMeasureId = "m_0";
        const secondMeasureId = "m_1";

        const coloursManualWidth = 400;
        const amountManualWidth = 100;

        const manuallyResizedColumns: IResizedColumns = {
            m_0: {
                width: amountManualWidth,
                source: ColumnEventSourceType.UI_DRAGGED,
            },
            [coloursId]: {
                width: coloursManualWidth,
                source: ColumnEventSourceType.UI_DRAGGED,
            },
        };

        const coloursAutoWidth = 76;
        const amountAutoWidth = 77;
        const biggerAmountAutoWidth = 116;

        const autoResizeColumns: IResizedColumns = {
            [firstMeasureId]: {
                width: amountAutoWidth,
                source: ColumnEventSourceType.AUTOSIZE_COLUMNS,
            },
            [coloursId]: {
                width: coloursAutoWidth,
                source: ColumnEventSourceType.AUTOSIZE_COLUMNS,
            },
            [secondMeasureId]: {
                width: biggerAmountAutoWidth,
                source: ColumnEventSourceType.AUTOSIZE_COLUMNS,
            },
        };

        const coloursGrowToFitWidth = 400;
        const amountGrowToFitWidth = 400;
        const biggerAmountGrowToFitWidth = 400;

        const growToFitResizeColumns: IResizedColumns = {
            [firstMeasureId]: {
                width: amountGrowToFitWidth,
                source: ColumnEventSourceType.FIT_GROW,
            },
            [coloursId]: {
                width: coloursGrowToFitWidth,
                source: ColumnEventSourceType.FIT_GROW,
            },
            [secondMeasureId]: {
                width: biggerAmountGrowToFitWidth,
                source: ColumnEventSourceType.FIT_GROW,
            },
        };

        const overLimitWidth = MANUALLY_SIZED_MAX_WIDTH + 100;

        const getGrowToFitResizeColumnsOverLimit = () => {
            return {
                ...growToFitResizeColumns,
                [firstMeasureId]: { width: overLimitWidth, source: ColumnEventSourceType.FIT_GROW },
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
                    {},
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
                    {},
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
                    {},
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
                    {},
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
                    {},
                    {},
                    DEFAULT_COLUMN_WIDTH,
                    false,
                    getGrowToFitResizeColumnsOverLimit(),
                );

                expect(columnDefinitions).toMatchSnapshot();
            });
        });
    });

    function getFakeColumnApi(columnsMaps: { [id: string]: Column }): ColumnApi {
        const fakeColumnApi = {
            getColumn: (columnId: string) => {
                return columnsMaps[columnId];
            },
            setColumnWidth: (column: Column, width: number) => {
                columnsMaps[column.getColId()].getColDef().width = width;
            },
            getAllColumns: () => {
                return Object.keys(columnsMaps).map((colId: string) => columnsMaps[colId]);
            },
        };
        return fakeColumnApi as ColumnApi;
    }

    function getFakeColumn(columnDefinition: any): Column {
        const fakeColumn = {
            getColDef: () => {
                return columnDefinition;
            },
            getColId: () => {
                return columnDefinition.colId;
            },
        };

        return fakeColumn as Column;
    }

    const colId1 = "colId1";
    const colId2 = "colId2";
    const colId3 = "colId3";

    const oldResizeColumns: IResizedColumns = {
        [colId1]: {
            width: 100,
            source: ColumnEventSourceType.UI_DRAGGED,
        },
        [colId2]: {
            width: 200,
            source: ColumnEventSourceType.UI_DRAGGED,
        },
    };
    const newResizeColumns: IResizedColumns = {
        [colId2]: {
            width: 400,
            source: ColumnEventSourceType.UI_DRAGGED,
        },
        [colId3]: {
            width: 500,
            source: ColumnEventSourceType.UI_DRAGGED,
        },
    };

    describe("syncSuppressSizeToFitOnColumns", () => {
        it("should set correctly suppressSizeToFit for columns ", () => {
            const columnDef1 = { suppressSizeToFit: true, width: 100, colId: colId1 };
            const columnDef2 = { suppressSizeToFit: true, width: 200, colId: colId2 };
            const columnDef3 = { suppressSizeToFit: false, width: 200, colId: colId3 };

            const columnsMaps = {
                colId1: getFakeColumn(columnDef1),
                colId2: getFakeColumn(columnDef2),
                colId3: getFakeColumn(columnDef3),
            };

            const columnApi = getFakeColumnApi(columnsMaps);

            syncSuppressSizeToFitOnColumns(oldResizeColumns, newResizeColumns, columnApi);

            expect(columnDef1.suppressSizeToFit).toEqual(false);

            expect(columnDef2.suppressSizeToFit).toEqual(true);

            expect(columnDef3.suppressSizeToFit).toEqual(true);
        });
    });

    describe("resetColumnsWidthToDefault", () => {
        it("should set correctly widths for columns: manual>auto>default", () => {
            const columnDef1 = { suppressSizeToFit: true, width: 100, colId: colId1 };
            const columnDef2 = { suppressSizeToFit: true, width: 200, colId: colId2 };
            const columnDef3 = { suppressSizeToFit: false, width: 200, colId: colId3 };

            const columnsMaps = {
                colId1: getFakeColumn(columnDef1),
                colId2: getFakeColumn(columnDef2),
                colId3: getFakeColumn(columnDef3),
            };

            const columnApi = getFakeColumnApi(columnsMaps);

            const manualWidths = {
                colId1: {
                    width: 300,
                    source: ColumnEventSourceType.UI_DRAGGED,
                },
            };

            const autoWidths = {
                colId1: {
                    width: 150,
                    source: ColumnEventSourceType.UI_DRAGGED,
                },
                colId2: {
                    width: 400,
                    source: ColumnEventSourceType.UI_DRAGGED,
                },
            };
            const defaultWidth = 250;

            resetColumnsWidthToDefault(
                columnApi,
                columnApi.getAllColumns(),
                manualWidths,
                autoWidths,
                defaultWidth,
            );

            expect(columnDef1.width).toEqual(300);

            expect(columnDef2.width).toEqual(400);

            expect(columnDef3.width).toEqual(250);
        });
    });
});
