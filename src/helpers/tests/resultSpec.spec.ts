// (C) 2007-2018 GoodData Corporation
import { VisualizationObject, AFM } from "@gooddata/typings";

import { getResultSpec, getStackingResultSpec } from "../resultSpec";
import { visualizationObjects } from "../../../__mocks__/fixtures";
import { ATTRIBUTE_1, ATTRIBUTE_2, MEASURE_1 } from "../../../stories/data/componentProps";

describe("getResultSpec", () => {
    it("should return a resultSpec for a bucket with a measure", () => {
        const buckets: VisualizationObject.IBucket[] =
            visualizationObjects[2].visualizationObject.content.buckets;

        const expectedResultSpec: AFM.IResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: [],
                },
            ],
        };

        expect(getResultSpec(buckets)).toEqual(expectedResultSpec);
    });
    it("should return a resultSpec for a bucket with a measure and an attribute", () => {
        const buckets: VisualizationObject.IBucket[] =
            visualizationObjects[1].visualizationObject.content.buckets;

        const expectedResultSpec: AFM.IResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: ["a1"],
                },
            ],
        };

        expect(getResultSpec(buckets)).toEqual(expectedResultSpec);
    });
    it("should return a resultSpec with sorting", () => {
        const buckets: VisualizationObject.IBucket[] =
            visualizationObjects[2].visualizationObject.content.buckets;

        const measureSortItem: AFM.IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: "m1",
                        },
                    },
                ],
            },
        };

        const expectedResultSpec: AFM.IResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: [],
                },
            ],
            sorts: [
                {
                    measureSortItem: {
                        direction: "asc",
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
        };

        expect(getResultSpec(buckets, [measureSortItem])).toEqual(expectedResultSpec);
    });
    it("should return a resultSpec with a custom getDimensions function", () => {
        const buckets: VisualizationObject.IBucket[] =
            visualizationObjects[2].visualizationObject.content.buckets;

        const expectedResultSpec: AFM.IResultSpec = {
            dimensions: [],
        };

        const getDimensions = (): undefined[] => [];

        expect(getResultSpec(buckets, null, getDimensions)).toEqual(expectedResultSpec);
    });
});
describe("getStackingResultSpec", () => {
    it("should return a resultSpec using generateDefaultDimensions for non-stacking charts", () => {
        const buckets: VisualizationObject.IBucket[] =
            visualizationObjects[2].visualizationObject.content.buckets;

        const measureSortItem: AFM.IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: "m1",
                        },
                    },
                ],
            },
        };

        const expectedResultSpec: AFM.IResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: [],
                },
            ],
            sorts: [
                {
                    measureSortItem: {
                        direction: "asc",
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
        };

        expect(getStackingResultSpec(buckets, [measureSortItem])).toEqual(expectedResultSpec);
    });
    it("should return a resultSpec using generateStackedDimensions for stacking charts", () => {
        const buckets: VisualizationObject.IBucket[] = [
            {
                localIdentifier: "measures",
                items: [MEASURE_1],
            },
            {
                localIdentifier: "attribute",
                items: [ATTRIBUTE_2],
            },
            {
                localIdentifier: "stack",
                items: [ATTRIBUTE_1],
            },
        ];

        const measureSortItem: AFM.IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: "m1",
                        },
                    },
                ],
            },
        };

        const expectedResultSpec: AFM.IResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ["a1"],
                },
                {
                    itemIdentifiers: ["a2", "measureGroup"],
                },
            ],
            sorts: [
                {
                    measureSortItem: {
                        direction: "asc",
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
        };

        expect(getStackingResultSpec(buckets, [measureSortItem])).toEqual(expectedResultSpec);
    });
});
