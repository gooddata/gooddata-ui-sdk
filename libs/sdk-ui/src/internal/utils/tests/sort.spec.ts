// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import {
    createSorts,
    getAttributeSortItem,
    getBucketItemIdentifiers,
    removeInvalidSort,
    setSortItems,
} from "../sort";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import * as referencePointMocks from "../../mocks/referencePointMocks";
import { DEFAULT_BASE_CHART_UICONFIG } from "../../constants/uiConfig";
import { SORT_DIR_ASC, SORT_DIR_DESC } from "../../constants/sort";
import { ATTRIBUTE, FILTERS, METRIC } from "../../constants/bucket";
import {
    emptyInsight,
    insightWithNoMeasureAndTwoViewBy,
    insightWithSingleMeasure,
    insightWithSingleMeasureAndStack,
    insightWithSingleMeasureAndViewBy,
    insightWithSingleMeasureAndViewByAndStack,
    insightWithTwoMeasuresAndViewBy,
} from "../../mocks/testMocks";
import { IAttributeSortItem, IMeasureSortItem, insightWithSorts, SortItem } from "@gooddata/sdk-model";

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
        describe("table", () => {
            it("should sort by first attribute ASC", () => {
                const expectedSorts: SortItem[] = [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a1",
                            direction: "asc",
                        },
                    },
                ];
                expect(createSorts("table", insightWithNoMeasureAndTwoViewBy)).toEqual(expectedSorts);
            });

            it("should sort by first attribute ASC if there are some measures", () => {
                const expectedSorts: SortItem[] = [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a1",
                            direction: "asc",
                        },
                    },
                ];
                expect(createSorts("table", insightWithTwoMeasuresAndViewBy)).toEqual(expectedSorts);
            });

            it("should sort by first measure DESC if there are no attributes", () => {
                const expectedSort: SortItem[] = [
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
                expect(createSorts("table", insightWithSingleMeasure)).toEqual(expectedSort);
            });
        });

        describe("bar", () => {
            it("should sort by first measure for basic bar chart", () => {
                const expectedSort: SortItem[] = [
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

            it("should return area sort for stacked bar chart", () => {
                const expectedSort: SortItem[] = [
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
    });

    it("should extract sort from visualization properties", () => {
        const sortItems: SortItem[] = [
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
        const testInsight = insightWithSorts(insightWithSingleMeasure, sortItems);

        expect(createSorts("table", testInsight)).toEqual(sortItems);
    });

    it("should ignore sort from visualization properties if localIdentifier is missing in AFM", () => {
        const sortItems: SortItem[] = [
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

        const testInsight = insightWithSorts(emptyInsight, sortItems);

        expect(createSorts("table", testInsight)).toEqual([]);
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

describe("removeInvalidSort", () => {
    it("should remove sorts with with identifiers that are not included in buckets", () => {
        const invalidAttributeSort: IAttributeSortItem = {
            attributeSortItem: {
                attributeIdentifier: "invalid",
                direction: SORT_DIR_DESC,
            },
        };
        const invalidMeasureSort1: IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: "invalid",
                            element: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                        },
                    },
                ],
            },
        };
        const invalidMeasureSort2: IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: "invalid",
                        },
                    },
                ],
            },
        };
        const referencePointWithInvalidSortItems = {
            ...referencePoint,
            properties: {
                sortItems: [
                    ...referencePoint.properties.sortItems,
                    invalidAttributeSort,
                    invalidMeasureSort1,
                    invalidMeasureSort2,
                ],
            },
        };

        const sanitizedSortItems = removeInvalidSort(referencePointWithInvalidSortItems).properties.sortItems;

        expect(sanitizedSortItems).toEqual(referencePoint.properties.sortItems);
    });
});

describe("setSortItems", () => {
    const emptyReferencePoint: IExtendedReferencePoint = {
        buckets: [],
        filters: {
            localIdentifier: FILTERS,
            items: [],
        },
        uiConfig: {
            buckets: {},
        },
        properties: {
            sortItems: [],
        },
    };

    it("should return unchanged reference if there are sort properties present", () => {
        const measureSortItem: IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: "invalid",
                        },
                    },
                ],
            },
        };

        const referencePointWithSortItems: IExtendedReferencePoint = cloneDeep({
            ...emptyReferencePoint,
            properties: {
                sortItems: [measureSortItem],
            },
        });

        expect(setSortItems(referencePointWithSortItems)).toEqual(referencePointWithSortItems);
    });

    it("should return unchanged reference if there are no sort properties nor bucket items present", () => {
        const noSortNoItemsRefPoint: IExtendedReferencePoint = cloneDeep({
            ...emptyReferencePoint,
        });

        expect(setSortItems(noSortNoItemsRefPoint)).toEqual(noSortNoItemsRefPoint);
    });

    it("should add descending sort item based on first measure if there is a measure but no attribute", () => {
        const onlyMeasureRefPoint: IExtendedReferencePoint = cloneDeep({
            ...emptyReferencePoint,
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            type: METRIC,
                            localIdentifier: "m1",
                        },
                        {
                            type: METRIC,
                            localIdentifier: "m2",
                        },
                    ],
                },
            ],
        });

        expect(setSortItems(onlyMeasureRefPoint).properties).toEqual({
            sortItems: [
                {
                    measureSortItem: {
                        direction: SORT_DIR_DESC,
                        locators: [
                            {
                                measureLocatorItem: {
                                    measureIdentifier: "m1",
                                },
                            },
                        ],
                    },
                },
            ],
        });
    });

    it("should skip invalid arithmetic measures", () => {
        const onlyMeasureRefPoint: IExtendedReferencePoint = cloneDeep({
            ...emptyReferencePoint,
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            type: METRIC,
                            localIdentifier: "am1",
                            operator: "sum",
                            operandLocalIdentifiers: ["m1", null],
                        },
                        {
                            type: METRIC,
                            localIdentifier: "am2",
                            operator: "sum",
                            operandLocalIdentifiers: ["m1", "m1"],
                        },
                        {
                            type: METRIC,
                            localIdentifier: "m1",
                        },
                    ],
                },
            ],
        });

        expect(setSortItems(onlyMeasureRefPoint).properties).toEqual({
            sortItems: [
                {
                    measureSortItem: {
                        direction: SORT_DIR_DESC,
                        locators: [
                            {
                                measureLocatorItem: {
                                    measureIdentifier: "am2",
                                },
                            },
                        ],
                    },
                },
            ],
        });
    });

    it("should add ascending sort item based on first attribute if there is an attribute but no measure", () => {
        const onlyAttributeRefPoint: IExtendedReferencePoint = cloneDeep({
            ...emptyReferencePoint,
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            type: ATTRIBUTE,
                            localIdentifier: "a1",
                        },
                    ],
                },
            ],
        });

        expect(setSortItems(onlyAttributeRefPoint).properties).toEqual({
            sortItems: [
                {
                    attributeSortItem: {
                        attributeIdentifier: "a1",
                        direction: SORT_DIR_ASC,
                    },
                },
            ],
        });
    });

    it("should not add any sort items if there are both measure and attribute", () => {
        const refPoint: IExtendedReferencePoint = cloneDeep({
            ...emptyReferencePoint,
            buckets: [
                {
                    localIdentifier: "misc",
                    items: [
                        {
                            type: ATTRIBUTE,
                            localIdentifier: "a1",
                        },
                        {
                            type: METRIC,
                            localIdentifier: "m1",
                        },
                    ],
                },
            ],
        });

        expect(setSortItems(refPoint)).toBe(refPoint);
    });
});
