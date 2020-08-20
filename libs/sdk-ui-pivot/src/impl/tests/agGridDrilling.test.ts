// (C) 2007-2020 GoodData Corporation

import { IMappingHeader, createIntlMock, getDrillIntersection } from "@gooddata/sdk-ui";
import { assignDrillItemsAndType, getDrillRowData, getMeasureDrillItem } from "../agGridDrilling";
import { IGridHeader } from "../agGridTypes";
import { getTreeLeaves } from "../agGridUtils";
import { IDimensionItemDescriptor, IResultMeasureHeader } from "@gooddata/sdk-backend-spi";
import { createTableHeaders } from "../agGridHeaders";
import { createRowData } from "../agGridData";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../__mocks__/recordings";

const pivotTableWithColumnAndRowAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
    DataViewFirstPage,
);
const intl = createIntlMock();

// TODO: enhance these tests to be parameterized and exercise code with different fixtures (recordings)

describe("getMeasureDrillItem", () => {
    it("should return measure drill item based on response headers", () => {
        const responseHeaders: IDimensionItemDescriptor[] = pivotTableWithColumnAndRowAttributes
            .meta()
            .dimensionItemDescriptors(1);
        const header: IResultMeasureHeader = {
            measureHeaderItem: {
                name: "not important",
                order: 0,
            },
        };

        expect(getMeasureDrillItem(responseHeaders, header)).toMatchSnapshot();
    });
    it("should return null if the header cannot be found", () => {
        const responseHeaders1: IDimensionItemDescriptor[] = pivotTableWithColumnAndRowAttributes
            .meta()
            .dimensionItemDescriptors(0);
        const responseHeaders2: IDimensionItemDescriptor[] = pivotTableWithColumnAndRowAttributes
            .meta()
            .dimensionItemDescriptors(1);
        const header: IResultMeasureHeader = {
            measureHeaderItem: {
                name: "not important",
                order: 99,
            },
        };

        expect(getMeasureDrillItem(responseHeaders1, header)).toBe(null);
        expect(getMeasureDrillItem(responseHeaders2, header)).toBe(null);
    });
});

describe("assignDrillItemsAndType", () => {
    it("should assign measure header item drillItems and type to header", () => {
        const header: IGridHeader = {
            headerName: "test",
            drillItems: [],
        };
        const currentHeader = pivotTableWithColumnAndRowAttributes.meta().allHeaders()[1][1][0];
        const responseHeaders = pivotTableWithColumnAndRowAttributes.meta().dimensionItemDescriptors(1);
        const headerIndex = 0;
        const drillItems: IMappingHeader[] = [];
        assignDrillItemsAndType(header, currentHeader, responseHeaders, headerIndex, drillItems);
        expect(header.type).toEqual("MEASURE_COLUMN");
        expect(header.drillItems).toMatchSnapshot();
    });
    it("should assign attribute header type to header and attribute and attribute value to drillItems", () => {
        const header: IGridHeader = {
            headerName: "test",
            drillItems: [],
        };
        const currentHeader = pivotTableWithColumnAndRowAttributes.meta().allHeaders()[0][0][0];
        const responseHeaders = pivotTableWithColumnAndRowAttributes.meta().dimensionItemDescriptors(0);
        const headerIndex = 0;
        const drillItems: IMappingHeader[] = [];
        assignDrillItemsAndType(header, currentHeader, responseHeaders, headerIndex, drillItems);
        expect(header.type).toEqual("COLUMN_ATTRIBUTE_COLUMN");
        expect(drillItems).toMatchSnapshot();
        // assign empty array to drillItems header. Only leaf headers (measures) should have assigned drill items
        expect(header.drillItems).toEqual([]);
    });
});

describe("getDrillIntersection", () => {
    const tableHeaders = createTableHeaders(pivotTableWithColumnAndRowAttributes.dataView);
    const { rowData } = createRowData(tableHeaders, pivotTableWithColumnAndRowAttributes, intl);
    const columnDefs = tableHeaders.allHeaders;

    it("should return intersection of row attribute and row attribute value for row header cell", async () => {
        const rowColDef = columnDefs[0]; // row header
        const drillItems = [rowData[0].headerItemMap[rowColDef.field!], ...rowColDef.drillItems];
        const intersection = getDrillIntersection(drillItems);
        expect(intersection).toMatchSnapshot();
    });

    it("should return intersection of all column header attributes and values and a measure for column header cell", async () => {
        const colDef = getTreeLeaves(columnDefs)[2]; // column leaf header
        const intersection = getDrillIntersection(colDef.drillItems);
        expect(intersection).toMatchSnapshot();
    });

    // tslint:disable-next-line:max-line-length
    it("should return intersection without header property when measure has neither uri nor identifier (arithmetic measure)", async () => {
        const drillItems: IMappingHeader[] = [
            {
                measureHeaderItem: {
                    localIdentifier: "am1",
                    name: "Arithmetic measure",
                    format: "",
                },
            },
        ];
        const intersection = getDrillIntersection(drillItems);
        expect(intersection).toEqual([
            {
                header: {
                    measureHeaderItem: {
                        format: "",
                        localIdentifier: "am1",
                        name: "Arithmetic measure",
                    },
                },
            },
        ]);
    });
});

describe("getDrillRowData", () => {
    const tableHeaders = createTableHeaders(pivotTableWithColumnAndRowAttributes.dataView);
    const { rowData } = createRowData(tableHeaders, pivotTableWithColumnAndRowAttributes, intl);
    const columnDefs = tableHeaders.allHeaders;

    it("should return an array of row data", async () => {
        const leafColumnDefs = getTreeLeaves(columnDefs);
        const drillRow = getDrillRowData(leafColumnDefs, rowData[0]);
        expect(drillRow).toMatchSnapshot();
    });
});
