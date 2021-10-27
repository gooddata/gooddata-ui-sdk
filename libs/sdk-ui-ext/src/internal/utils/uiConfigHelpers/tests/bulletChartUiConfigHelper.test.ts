// (C) 2020-2021 GoodData Corporation
import * as referencePointMock from "../../../tests/mocks/referencePointMocks";
import { getBulletChartUiConfig } from "../bulletChartUiConfigHelper";
import { createInternalIntl } from "../../internalIntlProvider";
import { DEFAULT_BULLET_CHART_CONFIG } from "../../../constants/uiConfig";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";

describe("bulletChartUiConfigHelper", () => {
    describe("getBulletChartUiConfig", () => {
        const intl = createInternalIntl(DefaultLocale);
        const extendedReferencePoint = getBulletChartUiConfig(
            {
                ...referencePointMock.bulletChartWithMeasureInPrimaryBucket,
                uiConfig: DEFAULT_BULLET_CHART_CONFIG,
            },
            intl,
            VisualizationTypes.BULLET,
        );

        describe("'canAddItems' property", () => {
            it("should set 'canAddItems' bucket property falsy if it already contains a measure", () => {
                expect(extendedReferencePoint.uiConfig.buckets.measures.canAddItems).toBeFalsy();
            });

            it("should set 'canAddItems' bucket property truthy if it has no measures", () => {
                expect(extendedReferencePoint.uiConfig.buckets.secondary_measures.canAddItems).toBeTruthy();
                expect(extendedReferencePoint.uiConfig.buckets.tertiary_measures.canAddItems).toBeTruthy();
            });
        });

        describe("'icon' property", () => {
            it("should set 'icon' property in 'measures', 'secondary_measures', 'tertiary_measures' and 'view' buckets", () => {
                expect(extendedReferencePoint.uiConfig.buckets.measures.icon).toBeDefined();
                expect(extendedReferencePoint.uiConfig.buckets.secondary_measures.icon).toBeDefined();
                expect(extendedReferencePoint.uiConfig.buckets.tertiary_measures.icon).toBeDefined();
                expect(extendedReferencePoint.uiConfig.buckets.view.icon).toBeDefined();
            });
        });

        describe("'customError' property", () => {
            it("should set 'customError' property if there is a measure in 'secondary_measures' bucket, but 'measures' bucket is empty", () => {
                const extendedReferencePoint = getBulletChartUiConfig(
                    {
                        ...referencePointMock.bulletChartWithMeasureInSecondaryBucket,
                        uiConfig: DEFAULT_BULLET_CHART_CONFIG,
                    },
                    intl,
                    VisualizationTypes.BULLET,
                );

                expect(extendedReferencePoint.uiConfig.customError).toHaveProperty("heading");
                expect(extendedReferencePoint.uiConfig.customError).toHaveProperty("text");
            });

            it("should keep 'customError' property empty if there is a measure in bucket 'measure'", () => {
                const extendedReferencePoint = getBulletChartUiConfig(
                    {
                        ...referencePointMock.bulletChartWithMeasureInPrimaryBucket,
                        uiConfig: DEFAULT_BULLET_CHART_CONFIG,
                    },
                    intl,
                    VisualizationTypes.BULLET,
                );
                expect(extendedReferencePoint.uiConfig.customError).toBeUndefined();
            });
        });

        it("should return bullet chart ui config", () => {
            const refPointMock = {
                ...referencePointMock.threeMeasuresBucketsReferencePoint,
                uiConfig: DEFAULT_BULLET_CHART_CONFIG,
            };
            const bulletChartUiConfig = getBulletChartUiConfig(refPointMock, intl, VisualizationTypes.BULLET);
            expect(bulletChartUiConfig).toMatchSnapshot();
        });
    });
});
