// (C) 2007-2019 GoodData Corporation

import { getSortItemByColId, getSortsFromModel } from "../agGridSorting";
import * as fixtures from "../../../../__mocks__/fixtures";

describe("getSortItemByColId", () => {
    const pivotTableWithColumnAndRowAttributes = fixtures.pivotTableWithColumnAndRowAttributes;
    it("should return an attributeSortItem", () => {
        expect(getSortItemByColId(pivotTableWithColumnAndRowAttributes.result(), "a_2211", "asc")).toEqual({
            attributeSortItem: { attributeIdentifier: "state", direction: "asc" },
        });
    });
    it("should return a measureSortItem", () => {
        expect(
            getSortItemByColId(pivotTableWithColumnAndRowAttributes.result(), "a_2009_1-a_2071_1-m_0", "asc"),
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
    const pivotTableWithColumnAndRowAttributes = fixtures.pivotTableWithColumnAndRowAttributes;

    it("should return sortItems for row attribute sort", () => {
        const sortModel: any[] = [
            {
                colId: "a_2211",
                sort: "asc",
            },
        ];
        expect(getSortsFromModel(sortModel, pivotTableWithColumnAndRowAttributes.result())).toEqual([
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
        expect(getSortsFromModel(sortModel, pivotTableWithColumnAndRowAttributes.result())).toEqual([
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
