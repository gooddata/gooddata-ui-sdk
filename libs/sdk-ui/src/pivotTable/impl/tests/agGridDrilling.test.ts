// (C) 2007-2019 GoodData Corporation

import * as fixtures from "../../../../__mocks__/fixtures";
import { IMappingHeader } from "../../../base/interfaces/MappingHeader";
import { createIntlMock } from "../../../base/helpers/intlUtils";
import { assignDrillItemsAndType, getDrillRowData, getMeasureDrillItem } from "../agGridDrilling";
import { IGridHeader } from "../agGridTypes";
import { getTreeLeaves } from "../agGridUtils";
import { IDimensionItemDescriptor, IResultMeasureHeader } from "@gooddata/sdk-backend-spi";
import { createTableHeaders } from "../agGridHeaders";
import { createRowData } from "../agGridData";
import { getDrillIntersection } from "../../../base/helpers/drilling";

const pivotTableWithColumnAndRowAttributes = fixtures.pivotTableWithColumnAndRowAttributes;
const intl = createIntlMock();

describe("getMeasureDrillItem", () => {
    it("should return measure drill item based on response headers", () => {
        const responseHeaders: IDimensionItemDescriptor[] = fixtures.barChartWithStackByAndOnlyOneStack.dimensionItemDescriptors(
            1,
        );
        const header: IResultMeasureHeader = {
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
        const responseHeaders1: IDimensionItemDescriptor[] = fixtures.barChartWithStackByAndOnlyOneStack.dimensionItemDescriptors(
            0,
        );
        const responseHeaders2: IDimensionItemDescriptor[] = fixtures.barChartWithStackByAndOnlyOneStack.dimensionItemDescriptors(
            1,
        );
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
        const currentHeader = fixtures.pivotTableWithColumnAndRowAttributes.allHeaders()[1][2][0];
        const responseHeaders = fixtures.pivotTableWithColumnAndRowAttributes.dimensionItemDescriptors(1);
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
        const currentHeader = fixtures.pivotTableWithColumnAndRowAttributes.allHeaders()[0][0][0];
        const responseHeaders = fixtures.pivotTableWithColumnAndRowAttributes.dimensionItemDescriptors(0);
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
    const tableHeaders = createTableHeaders(pivotTableWithColumnAndRowAttributes.dataView);
    const { rowData } = createRowData(tableHeaders, pivotTableWithColumnAndRowAttributes, intl);
    const columnDefs = tableHeaders.allHeaders;

    it("should return intersection of row attribute and row attribute value for row header cell", async () => {
        const rowColDef = columnDefs[0]; // row header
        const drillItems = [rowData[0].headerItemMap[rowColDef.field], ...rowColDef.drillItems];
        const intersection = getDrillIntersection(drillItems);
        expect(intersection).toEqual([
            {
                header: {
                    attributeHeader: {
                        formOf: {
                            identifier: "attr.restaurantlocation.locationstate",
                            name: "Location State",
                            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210",
                        },
                        identifier: "label.restaurantlocation.locationstate",
                        localIdentifier: "state",
                        name: "Location State",
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211",
                    },
                    attributeHeaderItem: {
                        name: "Alabama",
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109",
                    },
                },
            },
        ]);
    });

    it("should return intersection of all column header attributes and values and a measure for column header cell", async () => {
        const colDef = getTreeLeaves(columnDefs)[3]; // column leaf header
        const intersection = getDrillIntersection(colDef.drillItems);
        expect(intersection).toEqual([
            {
                header: {
                    attributeHeader: {
                        formOf: {
                            identifier: "date.quarter.in.year",
                            name: "Quarter (Date)",
                            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009",
                        },
                        identifier: "date.aam81lMifn6q",
                        localIdentifier: "year",
                        name: "default (Date)",
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2011",
                    },
                    attributeHeaderItem: {
                        name: "Q1",
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                    },
                },
            },
            {
                header: {
                    attributeHeader: {
                        formOf: {
                            identifier: "date.month.in.year",
                            name: "Month (Date)",
                            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071",
                        },
                        identifier: "date.abm81lMifn6q",
                        localIdentifier: "month",
                        name: "Short (Jan) (Date)",
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2073",
                    },
                    attributeHeaderItem: {
                        name: "Jan",
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                    },
                },
            },
            {
                header: {
                    measureHeaderItem: {
                        format: "[red][>=0]$#,##0;[<0]-$#,##0",
                        identifier: "aabHeqImaK0d",
                        localIdentifier: "franchiseFeesAdRoyaltyIdentifier",
                        name: "$ Franchise Fees (Ad Royalty)",
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6694",
                    },
                },
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
