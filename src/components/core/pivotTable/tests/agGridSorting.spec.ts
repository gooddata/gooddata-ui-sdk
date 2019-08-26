// (C) 2007-2019 GoodData Corporation

import { AFM } from "@gooddata/typings";
import * as fixtures from "../../../../../stories/test_data/fixtures";
import { assortDimensionHeaders } from "../agGridHeaders";
import {
    getAttributeSortItemFieldAndDirection,
    getMeasureSortItemFieldAndDirection,
    assignSorting,
    getSortItemByColId,
    getSortsFromModel,
} from "../agGridSorting";

const pivotTableWithColumnAndRowAttributes = fixtures.pivotTableWithColumnAndRowAttributes;

describe("getAttributeSortItemFieldAndDirection", () => {
    const dimensions = fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions;
    const { attributeHeaders } = assortDimensionHeaders(dimensions);
    const attributeSortItem: AFM.IAttributeSortItem = {
        attributeSortItem: {
            direction: "asc",
            attributeIdentifier: "state",
        },
    };
    it("should return matching key and direction from attributeHeaders", () => {
        expect(getAttributeSortItemFieldAndDirection(attributeSortItem, attributeHeaders)).toEqual([
            "a_2211",
            "asc",
        ]);
    });
});

describe("getMeasureSortItemFieldAndDirection", () => {
    const dimensions = fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions;
    const { measureHeaderItems } = assortDimensionHeaders(dimensions);
    const measureSortItem: AFM.IMeasureSortItem = {
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
    it("should return matching key and direction from attributeHeaders", () => {
        expect(getMeasureSortItemFieldAndDirection(measureSortItem, measureHeaderItems)).toEqual([
            "a_2009_1-a_2071_1-m_-1",
            "desc",
        ]);
    });
});

describe("assignSorting", () => {
    const ASC = "asc";
    const sortingMap = { a_1234: ASC };
    it("should assign sort property to the colDef with matching field", () => {
        const colDef = { field: "a_1234" };
        assignSorting(colDef, sortingMap);
        expect(colDef).toEqual({ field: "a_1234", sort: "asc" });
    });
    it("should return identical", () => {
        const colDef = { field: "a_5678" };
        assignSorting(colDef, sortingMap);
        expect(colDef).toEqual({ field: "a_5678" });
    });
});

describe("getSortItemByColId", () => {
    it("should return an attributeSortItem", () => {
        expect(getSortItemByColId(pivotTableWithColumnAndRowAttributes, "a_2211", "asc")).toEqual({
            attributeSortItem: { attributeIdentifier: "state", direction: "asc" },
        });
    });
    it("should return a measureSortItem", () => {
        expect(
            getSortItemByColId(pivotTableWithColumnAndRowAttributes, "a_2009_1-a_2071_1-m_0", "asc"),
        ).toEqual({
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: "year",
                            element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                        },
                    },
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: "month",
                            element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                        },
                    },
                    {
                        measureLocatorItem: {
                            measureIdentifier: "franchiseFeesIdentifier",
                        },
                    },
                ],
            },
        });
    });
});

describe("getSortsFromModel", () => {
    it("should return sortItems for row attribute sort", () => {
        const sortModel: any[] = [
            {
                colId: "a_2211",
                sort: "asc",
            },
        ];
        expect(getSortsFromModel(sortModel, pivotTableWithColumnAndRowAttributes)).toEqual([
            {
                attributeSortItem: {
                    attributeIdentifier: "state",
                    direction: "asc",
                },
            },
        ]);
    });
    it("should return sortItems for measure sort", () => {
        const sortModel: any[] = [
            {
                colId: "a_2009_1-a_2071_1-m_0",
                sort: "asc",
            },
        ];
        expect(getSortsFromModel(sortModel, pivotTableWithColumnAndRowAttributes)).toEqual([
            {
                measureSortItem: {
                    direction: "asc",
                    locators: [
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "year",
                                element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                            },
                        },
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "month",
                                element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                            },
                        },
                        {
                            measureLocatorItem: {
                                measureIdentifier: "franchiseFeesIdentifier",
                            },
                        },
                    ],
                },
            },
        ]);
    });
});
