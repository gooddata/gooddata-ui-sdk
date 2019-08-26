// (C) 2007-2019 GoodData Corporation

import { Execution } from "@gooddata/typings";
import * as fixtures from "../../../../../stories/test_data/fixtures";
import {
    assortDimensionHeaders,
    headerToGrid,
    identifyHeader,
    identifyResponseHeader,
    getRowHeaders,
    getFields,
    getColumnHeaders,
    getMinimalRowData,
    mergeHeaderEndIndex,
    shouldMergeHeaders,
} from "../agGridHeaders";

describe("identifyHeader", () => {
    it("should return correct field key for an attribute header", () => {
        expect(
            identifyHeader(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0][0][0],
            ),
        ).toBe("a_2210_6340109");
    });

    it("should return correct field key for a measure header", () => {
        expect(
            identifyHeader(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1][2][0],
            ),
        ).toBe("m_0");
    });
});
describe("identifyResponseHeader", () => {
    it("should return correct field key for an attribute response header", () => {
        expect(
            identifyResponseHeader(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers[0],
            ),
        ).toBe("a_2211");
    });
});

describe("headerToGrid", () => {
    it("should return correct grid header for an attribute header with correct prefix", () => {
        expect(
            headerToGrid(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0][0][0],
                "prefix_",
            ),
        ).toEqual({ field: "prefix_a_2210_6340109", headerName: "Alabama" });
    });

    it("should return correct grid header for a measure header with correct prefix", () => {
        expect(
            headerToGrid(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1][2][0],
                "prefix_",
            ),
        ).toEqual({ field: "prefix_m_0", headerName: "$ Franchise Fees" });
    });
});

describe("getColumnHeaders", () => {
    it("should return hierarchical column headers", () => {
        expect(
            getColumnHeaders(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1],
                fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[1].headers,
            ),
        ).toMatchSnapshot();
    });
});

describe("getRowHeaders", () => {
    it("should return an array of grid headers", () => {
        expect(
            getRowHeaders(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers,
                {},
                false,
            ),
        ).toEqual([
            {
                field: "a_2211",
                headerName: "Location State",
                type: "ROW_ATTRIBUTE_COLUMN",
                drillItems: [
                    {
                        attributeHeader: {
                            identifier: "label.restaurantlocation.locationstate",
                            localIdentifier: "state",
                            name: "Location State",
                            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211",
                            formOf: {
                                identifier: "attr.restaurantlocation.locationstate",
                                name: "Location State",
                                uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210",
                            },
                        },
                    },
                ],
            },
            {
                field: "a_2205",
                headerName: "Location Name",
                type: "ROW_ATTRIBUTE_COLUMN",
                drillItems: [
                    {
                        attributeHeader: {
                            identifier: "label.restaurantlocation.locationname",
                            localIdentifier: "location",
                            name: "Location Name",
                            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2205",
                            formOf: {
                                identifier: "attr.restaurantlocation.locationname",
                                name: "Location Name",
                                uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2204",
                            },
                        },
                    },
                ],
            },
        ]);
    });
    it("should return an array of grid headers with row group settings and extended by custom options", () => {
        expect(
            getRowHeaders(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers,
                { type: "custom" },
                true,
            ),
        ).toEqual([
            {
                field: "a_2211",
                headerName: "Location State",
                hide: true,
                rowGroup: true,
                type: "custom",
                drillItems: [
                    {
                        attributeHeader: {
                            identifier: "label.restaurantlocation.locationstate",
                            localIdentifier: "state",
                            name: "Location State",
                            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211",
                            formOf: {
                                identifier: "attr.restaurantlocation.locationstate",
                                name: "Location State",
                                uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210",
                            },
                        },
                    },
                ],
            },
            {
                field: "a_2205",
                headerName: "Location Name",
                hide: true,
                rowGroup: true,
                type: "custom",
                drillItems: [
                    {
                        attributeHeader: {
                            identifier: "label.restaurantlocation.locationname",
                            localIdentifier: "location",
                            name: "Location Name",
                            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2205",
                            formOf: {
                                identifier: "attr.restaurantlocation.locationname",
                                name: "Location Name",
                                uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2204",
                            },
                        },
                    },
                ],
            },
        ]);
    });
});

describe("getFields", () => {
    it("should return an array of all column fields", () => {
        expect(
            getFields(fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1]),
        ).toEqual([
            "a_2009_1-a_2071_1-m_0",
            "a_2009_1-a_2071_1-m_1",
            "a_2009_1-a_2071_1-m_2",
            "a_2009_1-a_2071_1-m_3",
            "a_2009_1-a_2071_2-m_0",
            "a_2009_1-a_2071_2-m_1",
            "a_2009_1-a_2071_2-m_2",
            "a_2009_1-a_2071_2-m_3",
            "a_2009_1-a_2071_3-m_0",
            "a_2009_1-a_2071_3-m_1",
            "a_2009_1-a_2071_3-m_2",
            "a_2009_1-a_2071_3-m_3",
            "a_2009_2-a_2071_4-m_0",
            "a_2009_2-a_2071_4-m_1",
            "a_2009_2-a_2071_4-m_2",
            "a_2009_2-a_2071_4-m_3",
            "a_2009_2-a_2071_5-m_0",
            "a_2009_2-a_2071_5-m_1",
            "a_2009_2-a_2071_5-m_2",
            "a_2009_2-a_2071_5-m_3",
            "a_2009_2-a_2071_6-m_0",
            "a_2009_2-a_2071_6-m_1",
            "a_2009_2-a_2071_6-m_2",
            "a_2009_2-a_2071_6-m_3",
            "a_2009_3-a_2071_7-m_0",
            "a_2009_3-a_2071_7-m_1",
            "a_2009_3-a_2071_7-m_2",
            "a_2009_3-a_2071_7-m_3",
            "a_2009_3-a_2071_8-m_0",
            "a_2009_3-a_2071_8-m_1",
            "a_2009_3-a_2071_8-m_2",
            "a_2009_3-a_2071_8-m_3",
            "a_2009_3-a_2071_9-m_0",
            "a_2009_3-a_2071_9-m_1",
            "a_2009_3-a_2071_9-m_2",
            "a_2009_3-a_2071_9-m_3",
            "a_2009_4-a_2071_10-m_0",
            "a_2009_4-a_2071_10-m_1",
            "a_2009_4-a_2071_10-m_2",
            "a_2009_4-a_2071_10-m_3",
            "a_2009_4-a_2071_11-m_0",
            "a_2009_4-a_2071_11-m_1",
            "a_2009_4-a_2071_11-m_2",
            "a_2009_4-a_2071_11-m_3",
            "a_2009_4-a_2071_12-m_0",
            "a_2009_4-a_2071_12-m_1",
            "a_2009_4-a_2071_12-m_2",
            "a_2009_4-a_2071_12-m_3",
        ]);
    });
});

describe("assortDimensionHeaders", () => {
    it("should return attribute and measure dimension headers", () => {
        const dimensions = fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions;
        const { attributeHeaders, measureHeaderItems } = assortDimensionHeaders(dimensions);
        expect(attributeHeaders).toHaveLength(4);
        expect(attributeHeaders.filter(header => Execution.isAttributeHeader(header))).toHaveLength(4);
        expect(measureHeaderItems).toHaveLength(4);
        expect(measureHeaderItems.filter(header => header.hasOwnProperty("measureHeaderItem"))).toHaveLength(
            4,
        );
    });
});

describe("getMinimalRowData", () => {
    it("should return a two-dimensional array of empty values when no measure data are available", () => {
        expect(
            getMinimalRowData(
                [],
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0],
            ),
        ).toEqual([[null], [null], [null], [null], [null], [null]]);
    });

    it("should return a identical data if measure data is available", () => {
        const data = [[1], [2], [3]];
        expect(
            getMinimalRowData(
                data,
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0],
            ),
        ).toBe(data);
    });
});

describe("conversion from header matrix to hierarchy", () => {
    const alabamaHeader = {
        attributeHeaderItem: {
            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=1",
            name: "Alabama",
        },
    };

    const californiaHeader = {
        attributeHeaderItem: {
            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=2",
            name: "California",
        },
    };

    const year2017Header = {
        attributeHeaderItem: {
            uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2212/elements?id=3",
            name: "2017",
        },
    };

    const costsHeader = {
        measureHeaderItem: {
            name: "Costs",
            order: 1,
        },
    };
    const revenuesHeader = {
        measureHeaderItem: {
            name: "Revenues",
            order: 2,
        },
    };

    const resultHeaderDimension: Execution.IResultHeaderItem[][] = [
        [alabamaHeader, alabamaHeader, californiaHeader, californiaHeader],
        [year2017Header, year2017Header, year2017Header, year2017Header],
        [costsHeader, revenuesHeader, costsHeader, revenuesHeader],
    ];

    const stateHeaderIndex = 0;
    const yearHeaderIndex = 1;
    const measureGroupHeaderIndex = 2;

    describe("shouldMergeHeaders", () => {
        it("should return true for headers that are identical and have no ancestors", () => {
            expect(shouldMergeHeaders(resultHeaderDimension, stateHeaderIndex, 0)).toBe(true);
        });
        it("should return true for headers that are identical and have identical ancestors", () => {
            expect(shouldMergeHeaders(resultHeaderDimension, yearHeaderIndex, 0)).toBe(true);
        });
        it("should return false for headers that are identical but have at least one non-identical ancestor", () => {
            expect(shouldMergeHeaders(resultHeaderDimension, yearHeaderIndex, 1)).toBe(false);
        });
        it("should return false for headers that are not identical", () => {
            expect(shouldMergeHeaders(resultHeaderDimension, measureGroupHeaderIndex, 0)).toBe(false);
        });
    });

    describe("mergeHeaderCount", () => {
        it("should return correct index of last header in row that can be merged with the current one", () => {
            expect(mergeHeaderEndIndex(resultHeaderDimension, stateHeaderIndex, 0)).toBe(1);
            expect(mergeHeaderEndIndex(resultHeaderDimension, stateHeaderIndex, 1)).toBe(1);
            expect(mergeHeaderEndIndex(resultHeaderDimension, stateHeaderIndex, 2)).toBe(3);
            expect(mergeHeaderEndIndex(resultHeaderDimension, stateHeaderIndex, 3)).toBe(3);
        });
    });
});
