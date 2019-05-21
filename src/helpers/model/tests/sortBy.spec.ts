// (C) 2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { attributeSortItem, measureSortItem } from "../sortBy";

describe("SortBy", () => {
    describe("attributeSortItem", () => {
        it("should return a simple sort item", () => {
            const expected: AFM.IAttributeSortItem = {
                attributeSortItem: {
                    attributeIdentifier: "foo",
                    direction: "asc",
                },
            };
            expect(attributeSortItem("foo", "asc")).toMatchObject(expected);
        });

        it("should return a simple sort item with aggregation", () => {
            const expected: AFM.IAttributeSortItem = {
                attributeSortItem: {
                    attributeIdentifier: "foo",
                    direction: "asc",
                    aggregation: "sum",
                },
            };
            expect(attributeSortItem("foo", "asc").aggregation("sum")).toMatchObject(expected);
        });
    });

    describe("measureSortItem", () => {
        it("should return a simple sort item", () => {
            const expected: AFM.IMeasureSortItem = {
                measureSortItem: {
                    direction: "asc",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "foo",
                            },
                        },
                    ],
                },
            };
            expect(measureSortItem("foo", "asc")).toMatchObject(expected);
        });

        it("should return a simple sort item", () => {
            const expected: AFM.IMeasureSortItem = {
                measureSortItem: {
                    direction: "asc",
                    locators: [
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "attr",
                                element: "elem",
                            },
                        },
                        {
                            measureLocatorItem: {
                                measureIdentifier: "foo",
                            },
                        },
                    ],
                },
            };
            expect(
                measureSortItem("foo", "asc").attributeLocators({
                    attributeIdentifier: "attr",
                    element: "elem",
                }),
            ).toMatchObject(expected);
        });
    });
});
