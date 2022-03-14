// (C) 2019-2022 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";
import {
    createSorts,
    getAttributeSortItem,
    getBucketItemIdentifiers,
    getDefaultTreemapSortFromBuckets,
    validateCurrentSort,
} from "../sort";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import * as referencePointMocks from "../../tests/mocks/referencePointMocks";
import { DEFAULT_BASE_CHART_UICONFIG } from "../../constants/uiConfig";
import { SORT_DIR_DESC } from "../../constants/sort";
import {
    insightWithSingleMeasureAndStack,
    insightWithSingleMeasureAndTwoViewBy,
    insightWithSingleMeasureAndViewBy,
    insightWithSingleMeasureAndViewByAndStack,
    insightWithTwoMeasuresAndTwoViewBy,
} from "../../tests/mocks/testMocks";
import {
    IAttributeSortItem,
    IMeasureSortItem,
    ISortItem,
    newAttribute,
    newAttributeAreaSort,
    newAttributeSort,
    newBucket,
    newMeasure,
    newMeasureSort,
} from "@gooddata/sdk-model";
import { newAvailableSortsGroup } from "../../interfaces/SortConfig";

const attributeSort: IAttributeSortItem = {
    attributeSortItem: {
        attributeIdentifier: "a1",
        direction: "asc",
    },
};

const measureSort: IMeasureSortItem = {
    measureSortItem: {
        direction: "asc",
        locators: [
            {
                attributeLocatorItem: {
                    attributeIdentifier: "a1",
                    element: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                },
            },
            {
                measureLocatorItem: {
                    measureIdentifier: "m1",
                },
            },
        ],
    },
};

const referencePoint: IExtendedReferencePoint = {
    ...referencePointMocks.multipleMetricBucketsAndCategoryReferencePoint,
    uiConfig: DEFAULT_BASE_CHART_UICONFIG,
    properties: {
        sortItems: [attributeSort, measureSort],
    },
};
// make sure nothing modifies the root object so we can share it between tests
Object.freeze(referencePoint);

describe("createSorts", () => {
    describe("default sorting", () => {
        describe("bar", () => {
            it("should sort by first measure for basic bar chart", () => {
                const expectedSort: ISortItem[] = [
                    {
                        measureSortItem: {
                            direction: "desc",
                            locators: [
                                {
                                    measureLocatorItem: {
                                        measureIdentifier: "m1",
                                    },
                                },
                            ],
                        },
                    },
                ];
                expect(createSorts("bar", insightWithSingleMeasureAndViewBy)).toEqual(expectedSort);
            });
            it("should sort by group for bar chart with 1 measure and 2 viewBy", () => {
                const expectedSort: ISortItem[] = [
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a1",
                        },
                    },
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a2",
                        },
                    },
                ];

                expect(createSorts("bar", insightWithSingleMeasureAndTwoViewBy)).toEqual(expectedSort);
            });

            it("should sort by group for bar chart with 2 measure and 2 viewBy", () => {
                const expectedSort: ISortItem[] = [
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a1",
                        },
                    },
                    {
                        measureSortItem: {
                            direction: "desc",
                            locators: [
                                {
                                    measureLocatorItem: {
                                        measureIdentifier: "m1",
                                    },
                                },
                            ],
                        },
                    },
                ];

                expect(createSorts("bar", insightWithTwoMeasuresAndTwoViewBy)).toEqual(expectedSort);
            });

            it("should sort by group for bar chart with 2 measure and 2 viewBy and canSortStackTotalValue is true", () => {
                const expectedSort: ISortItem[] = [
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a1",
                        },
                    },
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a2",
                        },
                    },
                ];

                expect(createSorts("bar", insightWithTwoMeasuresAndTwoViewBy, true)).toEqual(expectedSort);
            });

            it("should return no sort for stacked bar chart with only measure", () => {
                const expectedSort: ISortItem[] = [];
                expect(createSorts("bar", insightWithSingleMeasureAndStack)).toEqual(expectedSort);
            });
        });

        describe("column", () => {
            it("should return empty array", () => {
                expect(createSorts("column", insightWithSingleMeasureAndViewByAndStack)).toEqual([]);
            });
        });

        describe("line", () => {
            it("should return empty array", () => {
                expect(createSorts("line", insightWithSingleMeasureAndViewByAndStack)).toEqual([]);
            });
        });

        describe("pie", () => {
            it("should return empty array", () => {
                expect(createSorts("pie", insightWithSingleMeasureAndViewByAndStack)).toEqual([]);
            });
        });

        describe("table", () => {
            it("should return empty array", () => {
                expect(createSorts("table", insightWithSingleMeasureAndViewByAndStack)).toEqual([]);
            });
        });
    });
});

describe("getBucketItemIdentifiers", () => {
    it("should get all identifiers", () => {
        expect(getBucketItemIdentifiers(referencePoint)).toEqual(["m1", "m2", "m3", "a1"]);
    });
});

describe("getAttributeSortItem", () => {
    it("should return an attribute sort item", () => {
        expect(getAttributeSortItem("a1", SORT_DIR_DESC, true)).toEqual({
            attributeSortItem: { aggregation: "sum", attributeIdentifier: "a1", direction: "desc" },
        });
        expect(getAttributeSortItem("a2")).toEqual({
            attributeSortItem: { attributeIdentifier: "a2", direction: "asc" },
        });
    });
});

describe("getDefaultTreemapSortFromBuckets", () => {
    const measure1 = newMeasure("mid1", (m) => m.localId("m1").alias("Measure m1"));
    const attribute1 = newAttribute("aid1", (a) => a.localId("a1"));
    const attribute2 = newAttribute("aid2", (a) => a.localId("a2"));
    const viewBucket = newBucket(BucketNames.VIEW, attribute1);
    const segmentBucket = newBucket(BucketNames.SEGMENT, attribute2);
    const emptySegmentBucket = newBucket(BucketNames.SEGMENT);

    it("should get empty sort for only a single attribute", () => {
        const sort = getDefaultTreemapSortFromBuckets(viewBucket, emptySegmentBucket, [measure1]);
        expect(sort).toEqual([]);
    });

    it("should get attribute and measure sort if view by and stack by", () => {
        const sort = getDefaultTreemapSortFromBuckets(viewBucket, segmentBucket, [measure1]);
        expect(sort).toEqual([
            {
                attributeSortItem: {
                    direction: "asc",
                    attributeIdentifier: "a1",
                },
            },
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m1",
                            },
                        },
                    ],
                },
            },
        ]);
    });
});

describe("validateCurrentSort", () => {
    it("should handle empty currentSort", () => {
        expect(
            validateCurrentSort([], [], [newAvailableSortsGroup("a1")], [newAttributeSort("a1", "asc")]),
        ).toEqual([]);
    });

    it("should reuse attribute sort which changed only the order", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a2"), newAvailableSortsGroup("a1", ["m1"])],
                [newMeasureSort("m1", "desc"), newAttributeSort("a1", "asc")],
                [newAvailableSortsGroup("a1"), newAvailableSortsGroup("a2", ["m1"])],
                [newAttributeAreaSort("a1", "asc"), newMeasureSort("m1", "desc")],
            ),
        ).toEqual([newAttributeSort("a1", "asc"), newMeasureSort("m1", "desc")]);
    });

    it("should reuse both attribute and numeric sort when attributes changed the order", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1"), newAvailableSortsGroup("a2", ["m1"])],
                [newAttributeSort("a1", "asc"), newMeasureSort("m1", "asc")],
                [newAvailableSortsGroup("a2"), newAvailableSortsGroup("a1", ["m1"])],
                [newAttributeAreaSort("a2", "desc"), newMeasureSort("m1", "desc")],
            ),
        ).toEqual([newAttributeAreaSort("a2", "asc"), newAttributeSort("a1", "asc")]);
    });

    it("should reuse both numeric sorts when attributes changed the order", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1"), newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeAreaSort("a1", "desc"), newMeasureSort("m1", "desc")],
                [newAvailableSortsGroup("a2"), newAvailableSortsGroup("a1", ["m1", "m2"])],
                [newAttributeAreaSort("a2", "asc"), newMeasureSort("m1", "desc")],
            ),
        ).toEqual([newAttributeAreaSort("a2", "desc"), newAttributeAreaSort("a1", "desc")]);
    });

    it("should reuse both numeric sorts when attributes changed the order and there is single metric", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1"), newAvailableSortsGroup("a2", ["m1"], true, false)],
                [newAttributeAreaSort("a1", "asc"), newMeasureSort("m1", "desc")],
                [newAvailableSortsGroup("a2"), newAvailableSortsGroup("a1", ["m1"], true, false)],
                [newAttributeAreaSort("a2", "asc"), newMeasureSort("m1", "desc")],
            ),
        ).toEqual([newAttributeAreaSort("a2", "desc"), newMeasureSort("m1", "asc")]);
    });

    it("should keep second attribute sort when first attribute removed", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1"), newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeSort("a1", "asc"), newAttributeSort("a2", "desc")],
                [newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeSort("a2", "asc")],
            ),
        ).toEqual([newAttributeSort("a2", "desc")]);
    });

    it("should keep numeric sort from second item when first attribute removed", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1"), newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeAreaSort("a1", "desc"), newMeasureSort("m1", "desc")],
                [newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeSort("a2", "asc")],
            ),
        ).toEqual([newMeasureSort("m1", "desc")]);
    });

    it("should keep whole sort when first attribute replaced", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1"), newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeAreaSort("a1", "desc"), newMeasureSort("m1", "desc")],
                [newAvailableSortsGroup("a3"), newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeSort("a3", "asc"), newAttributeSort("a2", "asc")],
            ),
        ).toEqual([newAttributeAreaSort("a3", "desc"), newMeasureSort("m1", "desc")]);
    });

    it("should keep first sort when second attribute removed", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1", []), newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeAreaSort("a1", "desc"), newMeasureSort("m1", "desc")],
                [newAvailableSortsGroup("a1", ["m1", "m2"])],
                [newAttributeSort("a2", "asc")],
            ),
        ).toEqual([newAttributeAreaSort("a1", "desc")]);
    });

    it("should still apply second numeric sort when only one of measures removed and some still remain", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1", []), newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeAreaSort("a1", "desc"), newMeasureSort("m1", "desc")],
                [newAvailableSortsGroup("a1", []), newAvailableSortsGroup("a2", ["m2"])],
                [newAttributeSort("a1", "asc"), newAttributeSort("a2", "asc")],
            ),
        ).toEqual([newAttributeAreaSort("a1", "desc"), newMeasureSort("m2", "desc")]);
    });

    it("should keep area sort on attribute A1 and use default for A2 when A2 added before A1", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1", ["m1", "m2"])],
                [newAttributeAreaSort("a1", "desc")],
                [newAvailableSortsGroup("a2", []), newAvailableSortsGroup("a1", ["m1", "m2"])],
                [newAttributeSort("a2", "asc"), newAttributeSort("a1", "asc")],
            ),
        ).toEqual([newAttributeSort("a2", "asc"), newAttributeAreaSort("a1", "desc")]);
    });

    it("should keep numeric sort on attribute A1 and use default for A2 when A2 added before A1", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1", ["m1", "m2"])],
                [newMeasureSort("m1", "desc")],
                [newAvailableSortsGroup("a2", []), newAvailableSortsGroup("a1", ["m1", "m2"])],
                [newAttributeSort("a2", "asc"), newAttributeSort("a1", "asc")],
            ),
        ).toEqual([newAttributeSort("a2", "asc"), newMeasureSort("m1", "desc")]);
    });

    it("should apply default sort to newly added second attribute", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1", ["m1", "m2"])],
                [newAttributeAreaSort("a1", "desc")],
                [newAvailableSortsGroup("a1", []), newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeSort("a1", "asc"), newAttributeSort("a2", "asc")],
            ),
        ).toEqual([newAttributeAreaSort("a1", "desc"), newAttributeSort("a2", "asc")]);
    });

    it("should change A1 from metric to area sort and apply default sort to newly added second attribute when first has metric sort", () => {
        expect(
            validateCurrentSort(
                [newAvailableSortsGroup("a1", ["m1", "m2"])],
                [newMeasureSort("m1", "desc")],
                [newAvailableSortsGroup("a1", []), newAvailableSortsGroup("a2", ["m1", "m2"])],
                [newAttributeSort("a1", "asc"), newAttributeSort("a2", "asc")],
            ),
        ).toEqual([newAttributeAreaSort("a1", "desc"), newAttributeSort("a2", "asc")]);
    });
});
