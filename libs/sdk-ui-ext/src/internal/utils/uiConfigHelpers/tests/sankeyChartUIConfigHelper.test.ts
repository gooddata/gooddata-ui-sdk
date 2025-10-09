// (C) 2023-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { BucketNames } from "@gooddata/sdk-ui";

import { ATTRIBUTE, DATE, METRIC } from "../../../constants/bucket.js";
import { IExtendedReferencePoint } from "../../../interfaces/Visualization.js";
import { configBuckets } from "../sankeyChartUiConfigHelper.js";

describe("SankeyChartUIHelper", () => {
    describe("configBuckets", () => {
        it("sets the correct values when correct items are passed", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE_FROM,
                        items: [{ localIdentifier: "a1", type: ATTRIBUTE }],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE_TO,
                        items: [{ localIdentifier: "a2", type: ATTRIBUTE }],
                    },
                ],
                uiConfig: undefined,
                filters: undefined,
            };
            const config = configBuckets(referencePoint);
            expect(config).toMatchSnapshot();
        });

        it("sets the correct values when pass multi metrics/attributes from/to", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [
                            { localIdentifier: "m1", type: METRIC },
                            { localIdentifier: "m2", type: METRIC },
                        ],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE_FROM,
                        items: [
                            { localIdentifier: "a1", type: ATTRIBUTE },
                            { localIdentifier: "a2", type: ATTRIBUTE },
                        ],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE_TO,
                        items: [
                            { localIdentifier: "a3", type: ATTRIBUTE },
                            { localIdentifier: "a4", type: ATTRIBUTE },
                        ],
                    },
                ],
                uiConfig: undefined,
                filters: undefined,
            };
            const config = configBuckets(referencePoint);
            expect(config).toMatchSnapshot();
        });

        it("sets the correct values when pass metric and some attributes from", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE_FROM,
                        items: [
                            { localIdentifier: "a1", type: ATTRIBUTE },
                            { localIdentifier: "a2", type: DATE },
                        ],
                    },
                ],
                uiConfig: undefined,
                filters: undefined,
            };
            const config = configBuckets(referencePoint);
            expect(config).toMatchSnapshot();
        });

        it("sets the correct values when pass metric and some attributes to", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE_TO,
                        items: [
                            { localIdentifier: "a1", type: ATTRIBUTE },
                            { localIdentifier: "a2", type: ATTRIBUTE },
                        ],
                    },
                ],
                uiConfig: undefined,
                filters: undefined,
            };
            const config = configBuckets(referencePoint);
            expect(config).toMatchSnapshot();
        });

        it("sets the correct values when pass metric, attribute to, and some attributes without attribute from", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE_TO,
                        items: [{ localIdentifier: "a1", type: ATTRIBUTE }],
                    },
                    {
                        localIdentifier: BucketNames.SEGMENT,
                        items: [{ localIdentifier: "a2", type: ATTRIBUTE }],
                    },
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [{ localIdentifier: "a3", type: ATTRIBUTE }],
                    },
                ],
                uiConfig: undefined,
                filters: undefined,
            };
            const config = configBuckets(referencePoint);
            expect(config).toMatchSnapshot();
        });

        it("sets the correct values when pass metric, attribute from, and some attributes without attribute to", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE_FROM,
                        items: [{ localIdentifier: "a1", type: ATTRIBUTE }],
                    },
                    {
                        localIdentifier: BucketNames.SEGMENT,
                        items: [{ localIdentifier: "a2", type: ATTRIBUTE }],
                    },
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [{ localIdentifier: "a3", type: ATTRIBUTE }],
                    },
                ],
                uiConfig: undefined,
                filters: undefined,
            };
            const config = configBuckets(referencePoint);
            expect(config).toMatchSnapshot();
        });

        it("sets the correct values when pass metric and some attributes without attribute from/to", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [
                            { localIdentifier: "a1", type: ATTRIBUTE },
                            { localIdentifier: "a2", type: ATTRIBUTE },
                            { localIdentifier: "a3", type: ATTRIBUTE },
                        ],
                    },
                ],
                uiConfig: undefined,
                filters: undefined,
            };
            const config = configBuckets(referencePoint);
            expect(config).toMatchSnapshot();
        });
    });
});
