// (C) 2019-2024 GoodData Corporation
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";
import * as referencePointMock from "../../../tests/mocks/referencePointMocks.js";
import { setComboChartUiConfigDeprecated } from "../comboChartUiConfigHelperDeprecated.js";
import { createInternalIntl } from "../../internalIntlProvider.js";
import { COMBO_CHART_UICONFIG_DEPRECATED } from "../../../constants/uiConfig.js";
import { describe, it, expect } from "vitest";

describe("comboChartUiConfigHelper", () => {
    describe("setComboChartUiConfigDeprecated", () => {
        const intl = createInternalIntl(DefaultLocale);
        const refPointMock = {
            ...referencePointMock.twoMeasureBucketsReferencePoint,
            uiConfig: COMBO_CHART_UICONFIG_DEPRECATED,
        };

        it("should set bucket titles", () => {
            const referencePoint = setComboChartUiConfigDeprecated(
                refPointMock,
                intl,
                VisualizationTypes.COMBO,
            );
            const primaryMeasureBucket = referencePoint?.uiConfig?.buckets?.measures;
            const secondaryMeasureBucket = referencePoint?.uiConfig?.buckets?.secondary_measures;
            const viewBucket = referencePoint?.uiConfig?.buckets?.view;

            expect(primaryMeasureBucket.title).toEqual("Metrics");
            expect(secondaryMeasureBucket.title).toEqual("Metrics");
            expect(viewBucket.title).toEqual("View by");
        });

        it("should set bucket subtitles & icons", () => {
            const referencePoint = setComboChartUiConfigDeprecated(
                refPointMock,
                intl,
                VisualizationTypes.COMBO,
            );
            const primaryMeasureBucket = referencePoint?.uiConfig?.buckets?.measures;
            const secondaryMeasureBucket = referencePoint?.uiConfig?.buckets?.secondary_measures;

            expect(primaryMeasureBucket.icon).toBeDefined();
            expect(secondaryMeasureBucket.icon).toBeDefined();
            expect(primaryMeasureBucket.subtitle).toEqual("Column");
            expect(secondaryMeasureBucket.subtitle).toEqual("Line");
        });
    });
});
