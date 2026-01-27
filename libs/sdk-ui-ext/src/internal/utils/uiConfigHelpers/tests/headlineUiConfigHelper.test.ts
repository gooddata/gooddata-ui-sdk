// (C) 2019-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import {
    type IBucket,
    type ITheme,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { CalculateAs, DEFAULT_COMPARISON_PALETTE, type IChartConfig } from "@gooddata/sdk-ui-charts";

import { type HeadlineControlProperties } from "../../../interfaces/ControlProperties.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import {
    headlineWithMeasureInPrimaryBucket,
    headlineWithMeasureInSecondaryBucket,
} from "../../../tests/mocks/referencePointMocks.js";
import { createTestProperties, newInsight } from "../../../tests/testDataProvider.js";
import { createInternalIntl } from "../../internalIntlProvider.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../translations.js";
import {
    buildHeadlineVisualizationConfig,
    getComparisonColorPalette,
    getComparisonDefaultCalculationType,
    getHeadlineSupportedProperties,
    getHeadlineUiConfig,
    isComparisonEnabled,
} from "../headlineUiConfigHelper.js";

describe("headlineUiConfigHelper", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    describe("getHeadlineUiConfig", () => {
        const intl = createInternalIntl(DEFAULT_LANGUAGE, messages);

        describe("'canAddItems' property", () => {
            const uiConfig = getHeadlineUiConfig(headlineWithMeasureInPrimaryBucket, undefined, intl);

            it("should set 'canAddItems' bucket property falsy if it already contains a measure", () => {
                expect(uiConfig.buckets["secondary_measures"].canAddItems).toBeTruthy();
            });

            it("should set 'canAddItems' bucket property truthy if it has no measures", () => {
                expect(uiConfig.buckets["measures"].canAddItems).toBeFalsy();
            });
        });

        describe("'icon' property", () => {
            it("should set 'icon' property in both 'measures' and 'secondary_measures' buckets", () => {
                const uiConfig = getHeadlineUiConfig(headlineWithMeasureInPrimaryBucket, undefined, intl);
                expect(uiConfig.buckets["measures"].icon).toBeDefined();
                expect(uiConfig.buckets["secondary_measures"].icon).toBeDefined();
            });
        });

        describe("'customError' property", () => {
            it("should set 'customError' property if there is a measure in 'secondary_measures' bucket, but 'measures' bucket is empty", () => {
                const uiConfig = getHeadlineUiConfig(headlineWithMeasureInSecondaryBucket, undefined, intl);
                expect(uiConfig.customError).toHaveProperty("heading");
                expect(uiConfig.customError).toHaveProperty("text");
            });

            it("should keep 'customError' property empty if one of buckets contains a measure", () => {
                const uiConfig = getHeadlineUiConfig(headlineWithMeasureInPrimaryBucket, undefined, intl);
                expect(uiConfig.customError).toBeUndefined();
            });
        });

        describe("measures bucket titles", () => {
            it("should set bucket titles", () => {
                const uiConfig = getHeadlineUiConfig(headlineWithMeasureInPrimaryBucket, undefined, intl);
                expect(uiConfig.buckets["measures"].title).toEqual("Metric");
                expect(uiConfig.buckets["secondary_measures"].title).toEqual("Metric");
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
            expect(getHeadlineSupportedProperties({})).toEqual(
                createTestProperties<HeadlineControlProperties>({
                    comparison: {
                        enabled: true,
                    },
                }),
            );
        });

        it("Should return properties override default properties", () => {
            const visualizationProperties = createTestProperties<HeadlineControlProperties>({
                comparison: {
                    enabled: false,
                    calculationType: CalculateAs.DIFFERENCE,
                },
            });
            const properties: IVisualizationProperties<HeadlineControlProperties> = {
                ...visualizationProperties,
                controls: {
                    ...visualizationProperties.controls,
                    color: ["red"],
                },
            };

            expect(getHeadlineSupportedProperties(properties)).toEqual(properties);
        });
    });

    describe("buildHeadlineVisualizationConfig", () => {
        it("Should build config correctly", () => {
            const properties = createTestProperties<HeadlineControlProperties>({
                comparison: {
                    enabled: false,
                    calculationType: CalculateAs.DIFFERENCE,
                },
            });

            const config: IChartConfig = {
                separators: {
                    thousand: ",",
                    decimal: ".",
                },
            };

            expect(buildHeadlineVisualizationConfig(properties, { messages }, { messages, config })).toEqual({
                ...config,
                ...properties.controls,
                colorPalette: DEFAULT_COMPARISON_PALETTE,
                enableChartSorting: true,
                enableCompactSize: true,
                enableJoinedAttributeAxisName: true,
                enableReversedStacking: true,
                enableSeparateTotalLabels: true,
            });
        });
    });

    describe("getComparisonDefaultCalculationType", () => {
        it("Should return calculation type as change in case secondary measure is pop measure", () => {
            const insight = newInsight([
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newPopMeasure("foo", "attr")],
                },
            ]);
            expect(getComparisonDefaultCalculationType(insight)).toEqual(CalculateAs.CHANGE);
        });

        it("Should return calculation type as change in case secondary measure is previous period measure", () => {
            const insight = newInsight([
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newPreviousPeriodMeasure("foo", [{ dataSet: "bar", periodsAgo: 3 }])],
                },
            ]);
            expect(getComparisonDefaultCalculationType(insight)).toEqual(CalculateAs.CHANGE);
        });

        it("Should return calculation type as ratio in case secondary measure is not a derived measure", () => {
            const insight = newInsight([
                {
                    localIdentifier: BucketNames.SECONDARY_MEASURES,
                    items: [newMeasure("foo")],
                },
            ]);
            expect(getComparisonDefaultCalculationType(insight)).toEqual(CalculateAs.RATIO);
        });
    });

    describe("getComparisonColorPalette", () => {
        const theme: ITheme = {
            kpi: {
                value: {
                    positiveColor: "#00FF00",
                    negativeColor: "#FF0000",
                },
                secondaryInfoColor: "#0000FF",
            },
            palette: {
                complementary: {
                    c0: "#00FF00",
                    c6: "#CCCCCC",
                    c9: "#FF0000",
                },
            },
        };

        it("should return a color palette with positive, negative, and equals colors", () => {
            expect(getComparisonColorPalette(theme)).toMatchSnapshot();
        });

        it("should return a color palette with positive, negative, and equals colors when kpi.secondaryInfoColor is empty", () => {
            const themeWithoutSecondaryInfoColor = cloneDeep(theme);
            delete themeWithoutSecondaryInfoColor.kpi!.secondaryInfoColor;
            expect(getComparisonColorPalette(themeWithoutSecondaryInfoColor)).toMatchSnapshot();
        });

        it("should return a color palette with default colors when theme values are missing", () => {
            expect(getComparisonColorPalette({})).toMatchSnapshot();
        });
    });
});
