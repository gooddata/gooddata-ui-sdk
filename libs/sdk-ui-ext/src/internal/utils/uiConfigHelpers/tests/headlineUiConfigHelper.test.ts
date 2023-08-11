// (C) 2019-2020 GoodData Corporation
import { BucketNames, DefaultLocale } from "@gooddata/sdk-ui";
import { createInternalIntl } from "../../internalIntlProvider.js";
import {
    buildHeadlineVisualizationConfig,
    getHeadlineSupportedProperties,
    getHeadlineUiConfig,
    isComparisonEnabled,
} from "../headlineUiConfigHelper.js";
import * as referencePointMocks from "../../../tests/mocks/referencePointMocks.js";
import { describe, expect, it } from "vitest";
import { IBucket, newMeasure, newPopMeasure, newPreviousPeriodMeasure } from "@gooddata/sdk-model";
import { CalculationType, IChartConfig } from "@gooddata/sdk-ui-charts";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { HeadlineControlProperties } from "../../../interfaces/ControlProperties.js";
import { createTestProperties, newInsight } from "../../../tests/testDataProvider.js";

describe("headlineUiConfigHelper", () => {
    describe("getHeadlineUiConfig", () => {
        const intl = createInternalIntl(DefaultLocale);

        describe("'canAddItems' property", () => {
            const uiConfig = getHeadlineUiConfig(
                referencePointMocks.headlineWithMeasureInPrimaryBucket,
                intl,
            );

            it("should set 'canAddItems' bucket property falsy if it already contains a measure", () => {
                expect(uiConfig.buckets.secondary_measures.canAddItems).toBeTruthy();
            });

            it("should set 'canAddItems' bucket property truthy if it has no measures", () => {
                expect(uiConfig.buckets.measures.canAddItems).toBeFalsy();
            });
        });

        describe("'icon' property", () => {
            it("should set 'icon' property in both 'measures' and 'secondary_measures' buckets", () => {
                const uiConfig = getHeadlineUiConfig(
                    referencePointMocks.headlineWithMeasureInPrimaryBucket,
                    intl,
                );
                expect(uiConfig.buckets.measures.icon).toBeDefined();
                expect(uiConfig.buckets.secondary_measures.icon).toBeDefined();
            });
        });

        describe("'customError' property", () => {
            it("should set 'customError' property if there is a measure in 'secondary_measures' bucket, but 'measures' bucket is empty", () => {
                const uiConfig = getHeadlineUiConfig(
                    referencePointMocks.headlineWithMeasureInSecondaryBucket,
                    intl,
                );
                expect(uiConfig.customError).toHaveProperty("heading");
                expect(uiConfig.customError).toHaveProperty("text");
            });

            it("should keep 'customError' property empty if one of buckets contains a measure", () => {
                const uiConfig = getHeadlineUiConfig(
                    referencePointMocks.headlineWithMeasureInPrimaryBucket,
                    intl,
                );
                expect(uiConfig.customError).toBeUndefined();
            });
        });

        describe("measures bucket titles", () => {
            it("should set bucket titles", () => {
                const uiConfig = getHeadlineUiConfig(
                    referencePointMocks.headlineWithMeasureInPrimaryBucket,
                    intl,
                );
                expect(uiConfig.buckets.measures.title).toEqual("Measure");
                expect(uiConfig.buckets.secondary_measures.title).toEqual("Measure");
            });
        });
    });

    describe("isComparisonEnabled", () => {
        it("Should return true when bucket have 1 primary measure", () => {
            const buckets: IBucket[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [newMeasure("measure-1")],
                },
            ];

            const insight = newInsight(buckets);
            expect(isComparisonEnabled(insight)).toBe(false);
        });

        it("Should return true when bucket have 1 primary measure and 2 secondary measures", () => {
            const buckets: IBucket[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [newMeasure("measure-1")],
                },
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newMeasure("measure-2"), newMeasure("measure-3")],
                },
            ];

            const insight = newInsight(buckets);
            expect(isComparisonEnabled(insight)).toBe(false);
        });

        it("Should return false when bucket have 1 primary measure and 1 secondary measure", () => {
            const buckets: IBucket[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [newMeasure("measure-1")],
                },
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newMeasure("measure-2")],
                },
            ];

            const insight = newInsight(buckets);
            expect(isComparisonEnabled(insight)).toBe(true);
        });
    });

    describe("getHeadlineSupportedProperties", () => {
        it("Should return default control properties", () => {
            const buckets: IBucket[] = [
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newMeasure("measure-2")],
                },
            ];

            const insight = newInsight(buckets);
            expect(getHeadlineSupportedProperties(insight, {})).toEqual(
                createTestProperties<HeadlineControlProperties>({
                    comparison: {
                        enabled: true,
                        calculationType: CalculationType.RATIO,
                    },
                }),
            );
        });

        it("Should return default control properties for case secondary measure is derived measure", () => {
            let insight = newInsight([
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newPopMeasure("foo", "attr")],
                },
            ]);
            expect(getHeadlineSupportedProperties(insight, {})).toEqual(
                createTestProperties<HeadlineControlProperties>({
                    comparison: {
                        enabled: true,
                        calculationType: CalculationType.CHANGE,
                    },
                }),
            );

            insight = newInsight([
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newPreviousPeriodMeasure("foo", [{ dataSet: "bar", periodsAgo: 3 }])],
                },
            ]);
            expect(getHeadlineSupportedProperties(insight, {})).toEqual(
                createTestProperties<HeadlineControlProperties>({
                    comparison: {
                        enabled: true,
                        calculationType: CalculationType.CHANGE,
                    },
                }),
            );
        });

        it("Should return properties override default properties", () => {
            const buckets: IBucket[] = [
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newMeasure("measure-2")],
                },
            ];

            const visualizationProperties = createTestProperties<HeadlineControlProperties>({
                comparison: {
                    enabled: false,
                    calculationType: CalculationType.DIFFERENCE,
                },
            });
            const properties: IVisualizationProperties<HeadlineControlProperties> = {
                ...visualizationProperties,
                controls: {
                    ...visualizationProperties.controls,
                    color: ["red"],
                },
            };

            const insight = newInsight(buckets);
            expect(getHeadlineSupportedProperties(insight, properties)).toEqual(properties);
        });
    });

    describe("buildHeadlineVisualizationConfig", () => {
        it("Should build config correctly", () => {
            const insight = newInsight([
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newMeasure("measure-2")],
                },
            ]);

            const properties = createTestProperties<HeadlineControlProperties>({
                comparison: {
                    enabled: false,
                    calculationType: CalculationType.DIFFERENCE,
                },
            });

            const config: IChartConfig = {
                separators: {
                    thousand: ",",
                    decimal: ".",
                },
            };

            expect(buildHeadlineVisualizationConfig(insight, properties, {}, { config })).toEqual({
                ...config,
                ...properties.controls,
            });
        });
    });
});
