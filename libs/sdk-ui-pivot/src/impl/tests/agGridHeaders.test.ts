// (C) 2007-2020 GoodData Corporation

import { ReferenceRecordings, ReferenceLdm } from "@gooddata/reference-workspace";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import {
    IAttributeDescriptor,
    IResultHeader,
    isAttributeDescriptor,
    isMeasureDescriptor,
} from "@gooddata/sdk-backend-spi";
import { attributeLocalId, IAttributeSortItem, IMeasureSortItem } from "@gooddata/sdk-model";
import {
    assortDimensionDescriptors,
    getAttributeSortItemFieldAndDirection,
    getColumnHeaders,
    getFields,
    getMeasureSortItemFieldAndDirection,
    getMinimalRowData,
    getRowHeaders,
    headerToGrid,
    identifyHeader,
    identifyResponseHeader,
    mergeHeaderEndIndex,
    shouldMergeHeaders,
} from "../agGridHeaders";
import { recordedDataFacade } from "../../../__mocks__/recordings";
import { DataViewFacade } from "@gooddata/sdk-ui";

const fixture = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
    DataViewFirstPage,
);

describe("identifyHeader", () => {
    it("should return correct field key for an attribute header", () => {
        expect(identifyHeader(fixture.meta().allHeaders()[0][0][0])).toMatchSnapshot();
    });

    it("should return correct field key for a measure header", () => {
        expect(identifyHeader(fixture.meta().allHeaders()[1][1][0])).toMatchSnapshot();
    });
});
describe("identifyResponseHeader", () => {
    it("should return correct field key for an attribute response header", () => {
        expect(identifyResponseHeader(fixture.meta().dimensionItemDescriptors(0)[0])).toMatchSnapshot();
    });
});

describe("headerToGrid", () => {
    it("should return correct grid header for an attribute header with correct prefix", () => {
        expect(headerToGrid(fixture.meta().allHeaders()[0][0][0], "prefix_")).toMatchSnapshot();
    });

    it("should return correct grid header for a measure header with correct prefix", () => {
        expect(headerToGrid(fixture.meta().allHeaders()[1][1][0], "prefix_")).toMatchSnapshot();
    });
});

describe("getColumnHeaders", () => {
    it("should return hierarchical column headers", () => {
        expect(
            getColumnHeaders(fixture.meta().allHeaders()[1], fixture.meta().dimensionItemDescriptors(1)),
        ).toMatchSnapshot();
    });
});

describe("getRowHeaders", () => {
    it("should return an array of grid headers", () => {
        expect(
            getRowHeaders(fixture.meta().dimensionItemDescriptors(0) as IAttributeDescriptor[], {}, false),
        ).toMatchSnapshot();
    });
    it("should return an array of grid headers with row group settings and extended by custom options", () => {
        expect(
            getRowHeaders(
                fixture.meta().dimensionItemDescriptors(0) as IAttributeDescriptor[],
                { type: "custom" },
                true,
            ),
        ).toMatchSnapshot();
    });
});

describe("getFields", () => {
    const Fixtures: Array<[string, DataViewFacade]> = [
        [
            "single measure, single column",
            recordedDataFacade(
                ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
                DataViewFirstPage,
            ),
        ],
        [
            "single measure, multiple columns",
            recordedDataFacade(
                ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithTwoRowAndTwoColumnAttributes,
                DataViewFirstPage,
            ),
        ],
        [
            "two measures, single columns",
            recordedDataFacade(
                ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithRowAndColumnAttributes,
                DataViewFirstPage,
            ),
        ],
    ];

    it.each(Fixtures)("should correctly obtain column fields for %s", (_desc, facade) => {
        expect(getFields(facade.meta().allHeaders()[1])).toMatchSnapshot();
    });
});

describe("assortDimensionDescriptors", () => {
    it("should return attribute and measure dimension headers", () => {
        const dimensions = fixture.meta().dimensions();
        const { attributeDescriptors, measureDescriptors } = assortDimensionDescriptors(dimensions);
        expect(attributeDescriptors).toHaveLength(2);
        expect(attributeDescriptors.filter((header) => isAttributeDescriptor(header))).toHaveLength(2);
        expect(measureDescriptors).toHaveLength(1);
        expect(measureDescriptors.filter((header) => isMeasureDescriptor(header))).toHaveLength(1);
    });
});

describe("getMinimalRowData", () => {
    const NoMeasureData = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable.SingleAttribute,
        DataViewFirstPage,
    );
    const WithMeasureData = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAttribute,
        DataViewFirstPage,
    );

    it("should return a two-dimensional array of empty values when no measure data are available", () => {
        const result = getMinimalRowData(NoMeasureData);
        const expectedLength = NoMeasureData.meta().allHeaders()[0][0].length;

        expect(result.length).toEqual(expectedLength);
        expect(result.filter((e) => e[0] === null).length).toEqual(expectedLength);
    });

    it("should return a identical data if measure data is available", () => {
        const result = getMinimalRowData(WithMeasureData);
        const expectedLength = WithMeasureData.rawData().twoDimData().length;

        expect(result.length).toEqual(expectedLength);
        expect(result).toEqual(WithMeasureData.rawData().twoDimData());
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

    const resultHeaderDimension: IResultHeader[][] = [
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

describe("getAttributeSortItemFieldAndDirection", () => {
    const dimensions = fixture.meta().dimensions();
    const { attributeDescriptors } = assortDimensionDescriptors(dimensions);
    const attributeSortItem: IAttributeSortItem = {
        attributeSortItem: {
            direction: "asc",
            attributeIdentifier: attributeLocalId(ReferenceLdm.Product.Name),
        },
    };
    it("should return matching key and direction from attributeDescriptors", () => {
        expect(getAttributeSortItemFieldAndDirection(attributeSortItem, attributeDescriptors)).toEqual([
            "a_1055",
            "asc",
        ]);
    });
});

describe("getMeasureSortItemFieldAndDirection", () => {
    const dimensions = fixture.meta().dimensions();
    const { measureDescriptors } = assortDimensionDescriptors(dimensions);
    const measureSortItem: IMeasureSortItem = {
        measureSortItem: {
            direction: "desc",
            locators: [
                {
                    attributeLocatorItem: {
                        attributeIdentifier: "date.aam81lMifn6q",
                        element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                    },
                },
                {
                    attributeLocatorItem: {
                        attributeIdentifier: "date.abm81lMifn6q",
                        element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                    },
                },
                {
                    measureLocatorItem: {
                        measureIdentifier: "aaEGaXAEgB7U",
                    },
                },
            ],
        },
    };
    it("should return matching key and direction from measure descriptors", () => {
        expect(getMeasureSortItemFieldAndDirection(measureSortItem, measureDescriptors)).toEqual([
            "a_2009_1-a_2071_1-m_-1",
            "desc",
        ]);
    });
});
