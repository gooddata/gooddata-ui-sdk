// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { VisualizationTypes } from "@gooddata/sdk-ui";

import { DEFAULT_BULLET_CHART_CONFIG } from "../../../constants/uiConfig.js";
import {
    bulletChartWithMeasureInPrimaryBucket,
    bulletChartWithMeasureInSecondaryBucket,
    threeMeasuresBucketsReferencePoint,
} from "../../../tests/mocks/referencePointMocks.js";
import { createInternalIntl } from "../../internalIntlProvider.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../translations.js";
import { getBulletChartUiConfig } from "../bulletChartUiConfigHelper.js";

describe("bulletChartUiConfigHelper", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    describe("getBulletChartUiConfig", () => {
        const intl = createInternalIntl(DEFAULT_LANGUAGE, messages);
        const extendedReferencePoint = getBulletChartUiConfig(
            {
                ...bulletChartWithMeasureInPrimaryBucket,
                uiConfig: DEFAULT_BULLET_CHART_CONFIG,
            },
            intl,
            VisualizationTypes.BULLET,
        );

        describe("'canAddItems' property", () => {
            it("should set 'canAddItems' bucket property falsy if it already contains a measure", () => {
                expect(extendedReferencePoint.uiConfig!.buckets["measures"].canAddItems).toBeFalsy();
            });

            it("should set 'canAddItems' bucket property truthy if it has no measures", () => {
                expect(
                    extendedReferencePoint.uiConfig!.buckets["secondary_measures"].canAddItems,
                ).toBeTruthy();
                expect(
                    extendedReferencePoint.uiConfig!.buckets["tertiary_measures"].canAddItems,
                ).toBeTruthy();
            });
        });

        describe("'icon' property", () => {
            it("should set 'icon' property in 'measures', 'secondary_measures', 'tertiary_measures' and 'view' buckets", () => {
                expect(extendedReferencePoint.uiConfig!.buckets["measures"].icon).toBeDefined();
                expect(extendedReferencePoint.uiConfig!.buckets["secondary_measures"].icon).toBeDefined();
                expect(extendedReferencePoint.uiConfig!.buckets["tertiary_measures"].icon).toBeDefined();
                expect(extendedReferencePoint.uiConfig!.buckets["view"].icon).toBeDefined();
            });
        });

        describe("'customError' property", () => {
            it("should set 'customError' property if there is a measure in 'secondary_measures' bucket, but 'measures' bucket is empty", () => {
                const extendedReferencePoint = getBulletChartUiConfig(
                    {
                        ...bulletChartWithMeasureInSecondaryBucket,
                        uiConfig: DEFAULT_BULLET_CHART_CONFIG,
                    },
                    intl,
                    VisualizationTypes.BULLET,
                );

                expect(extendedReferencePoint.uiConfig!.customError).toHaveProperty("heading");
                expect(extendedReferencePoint.uiConfig!.customError).toHaveProperty("text");
            });

            it("should keep 'customError' property empty if there is a measure in bucket 'measure'", () => {
                const extendedReferencePoint = getBulletChartUiConfig(
                    {
                        ...bulletChartWithMeasureInPrimaryBucket,
                        uiConfig: DEFAULT_BULLET_CHART_CONFIG,
                    },
                    intl,
                    VisualizationTypes.BULLET,
                );
                expect(extendedReferencePoint.uiConfig!.customError).toBeUndefined();
            });
        });

        it("should return bullet chart ui config", () => {
            const refPointMock = {
                ...threeMeasuresBucketsReferencePoint,
                uiConfig: DEFAULT_BULLET_CHART_CONFIG,
            };
            const bulletChartUiConfig = getBulletChartUiConfig(refPointMock, intl, VisualizationTypes.BULLET);
            expect(bulletChartUiConfig).toMatchSnapshot();
        });
    });
});
