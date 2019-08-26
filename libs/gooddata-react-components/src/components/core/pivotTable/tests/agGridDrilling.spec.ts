// (C) 2007-2019 GoodData Corporation

import { Execution } from "@gooddata/typings";
import * as fixtures from "../../../../../stories/test_data/fixtures";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";
import { createIntlMock } from "../../../visualizations/utils/intlUtils";
import { executionToAGGridAdapter } from "../agGridDataSource";
import {
    getMeasureDrillItem,
    assignDrillItemsAndType,
    getDrillIntersection,
    getDrillRowData,
} from "../agGridDrilling";
import { IGridHeader } from "../agGridTypes";
import { getTreeLeaves } from "../agGridUtils";

const pivotTableWithColumnAndRowAttributes = fixtures.pivotTableWithColumnAndRowAttributes;
const intl = createIntlMock();

describe("getMeasureDrillItem", () => {
    it("should return measure drill item based on response headers", () => {
        const responseHeaders: Execution.IHeader[] =
            fixtures.barChartWithStackByAndOnlyOneStack.executionResponse.dimensions[1].headers;
        const header: Execution.IResultMeasureHeaderItem = {
            measureHeaderItem: {
                name: "not important",
                order: 0,
            },
        };
        const expectedDrillHeader: IMappingHeader = {
            measureHeaderItem: {
                identifier: "ah1EuQxwaCqs",
                localIdentifier: "amountMetric",
                name: "Amount",
                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279",
                format: "#,##0.00",
            },
        };

        expect(getMeasureDrillItem(responseHeaders, header)).toEqual(expectedDrillHeader);
    });
    it("should return null if the header cannot be found", () => {
        const responseHeaders1: Execution.IHeader[] =
            fixtures.barChartWithStackByAndOnlyOneStack.executionResponse.dimensions[0].headers;
        const responseHeaders2: Execution.IHeader[] =
            fixtures.barChartWithStackByAndOnlyOneStack.executionResponse.dimensions[1].headers;
        const header: Execution.IResultMeasureHeaderItem = {
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
        const currentHeader =
            fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1][2][0];
        const responseHeaders =
            fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[1].headers;
        const headerIndex = 0;
        const drillItems: IMappingHeader[] = [];
        assignDrillItemsAndType(header, currentHeader, responseHeaders, headerIndex, drillItems);
        const expectedDrillItems: IMappingHeader[] = [
            {
                measureHeaderItem: {
                    identifier: "aaEGaXAEgB7U",
                    localIdentifier: "franchiseFeesIdentifier",
                    name: "$ Franchise Fees",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6685",
                    format: "[>=0]$#,##0;[<0]-$#,##0",
                },
            },
        ];
        expect(header.type).toEqual("MEASURE_COLUMN");
        expect(header.drillItems).toEqual(expectedDrillItems);
    });
    it("should assign attribute header type to header and attribute and attribute value to drillItems", () => {
        const header: IGridHeader = {
            headerName: "test",
            drillItems: [],
        };
        const currentHeader =
            fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0][0][0];
        const responseHeaders =
            fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers;
        const headerIndex = 0;
        const drillItems: IMappingHeader[] = [];
        assignDrillItemsAndType(header, currentHeader, responseHeaders, headerIndex, drillItems);
        const expectedDrillItems: IMappingHeader[] = [
            {
                attributeHeaderItem: {
                    name: "Alabama",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109",
                },
            },
            {
                attributeHeader: {
                    identifier: "label.restaurantlocation.locationstate",
                    localIdentifier: "state",
                    name: "Location State",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211",
                    formOf: {
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210",
                        identifier: "attr.restaurantlocation.locationstate",
                        name: "Location State",
                    },
                },
            },
        ];
        expect(header.type).toEqual("COLUMN_ATTRIBUTE_COLUMN");
        expect(drillItems).toEqual(expectedDrillItems);
        // assign empty array to drillItems header. Only leaf headers (measures) should have assigned drill items
        expect(header.drillItems).toEqual([]);
    });
});

describe("getDrillIntersection", () => {
    const afm = pivotTableWithColumnAndRowAttributes.executionRequest.afm;
    const { columnDefs, rowData } = executionToAGGridAdapter(
        {
            executionResponse: pivotTableWithColumnAndRowAttributes.executionResponse,
            executionResult: pivotTableWithColumnAndRowAttributes.executionResult,
        },
        {},
        intl,
    );
    it("should return intersection of row attribute and row attribute value for row header cell", async () => {
        const rowColDef = columnDefs[0]; // row header
        const drillItems = [...rowColDef.drillItems, rowData[0].headerItemMap[rowColDef.field]];
        const intersection = getDrillIntersection(drillItems, afm);
        expect(intersection).toEqual([
            {
                header: {
                    identifier: "label.restaurantlocation.locationstate",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211",
                },
                id: "state",
                title: "Location State",
            },
            {
                header: {
                    identifier: "",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109",
                },
                id: "6340109",
                title: "Alabama",
            },
        ]);
    });

    it("should return intersection of all column header attributes and values and a measure for column header cell", async () => {
        const colDef = getTreeLeaves(columnDefs)[3]; // column leaf header
        const intersection = getDrillIntersection(colDef.drillItems, afm);
        expect(intersection).toEqual([
            {
                header: {
                    identifier: "",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                },
                id: "1",
                title: "Q1",
            },
            {
                header: {
                    identifier: "date.aam81lMifn6q",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2011",
                },
                id: "year",
                title: "Quarter (Date)",
            },
            {
                header: {
                    identifier: "",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                },
                id: "1",
                title: "Jan",
            },
            {
                header: {
                    identifier: "date.abm81lMifn6q",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2073",
                },
                id: "month",
                title: "Month (Date)",
            },
            {
                header: {
                    identifier: "aabHeqImaK0d",
                    uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6694",
                },
                id: "franchiseFeesAdRoyaltyIdentifier",
                title: "$ Franchise Fees (Ad Royalty)",
            },
        ]);
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
        const intersection = getDrillIntersection(drillItems, afm);
        expect(intersection).toEqual([
            {
                id: "am1",
                title: "Arithmetic measure",
            },
        ]);
    });
});

describe("getDrillRowData", () => {
    it("should return an array of row data", async () => {
        const { columnDefs, rowData } = executionToAGGridAdapter(
            {
                executionResponse: pivotTableWithColumnAndRowAttributes.executionResponse,
                executionResult: pivotTableWithColumnAndRowAttributes.executionResult,
            },
            {},
            intl,
        );
        const leafColumnDefs = getTreeLeaves(columnDefs);
        const drillRow = getDrillRowData(leafColumnDefs, rowData[0]);
        expect(drillRow).toEqual([
            {
                id: "6340109",
                name: "Alabama",
            },
            {
                id: "6340107",
                name: "Montgomery",
            },
            "160104.5665",
            "49454.8215",
            "40000",
            "70649.745",
            "156148.86625",
            "47826.00375",
            "40000",
            "68322.8625",
            "154299.8485",
            "47064.6435",
            "40000",
            "67235.205",
            "158572.501",
            "48823.971",
            "40000",
            "69748.53",
            "152789.662",
            "46442.802",
            "40000",
            "66346.86",
            "158587.036",
            "48829.956",
            "40000",
            "69757.08",
            "156553.19425",
            "47992.49175",
            "40000",
            "68560.7025",
            "147504.62125",
            "44266.60875",
            "40000",
            "63238.0125",
            "157944.04075",
            "48565.19325",
            "40000",
            "69378.8475",
            "156878.19175",
            "48126.31425",
            "40000",
            "68751.8775",
            "156446.52775",
            "47948.57025",
            "40000",
            "68497.9575",
            "130719.01675",
            "37354.88925",
            "40000",
            "53364.1275",
        ]);
    });
});
