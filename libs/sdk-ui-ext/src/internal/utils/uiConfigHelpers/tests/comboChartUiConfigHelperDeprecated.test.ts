// (C) 2019-2020 GoodData Corporation
import get from "lodash/get";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";
import * as referencePointMock from "../../../tests/mocks/referencePointMocks";
import { setComboChartUiConfigDeprecated } from "../comboChartUiConfigHelperDeprecated";
import { createInternalIntl } from "../../internalIntlProvider";
import { COMBO_CHART_UICONFIG_DEPRECATED } from "../../../constants/uiConfig";

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
            const primaryMeasureBucket = get(referencePoint, "uiConfig.buckets.measures");
            const secondaryMeasureBucket = get(referencePoint, "uiConfig.buckets.secondary_measures");
            const viewBucket = get(referencePoint, "uiConfig.buckets.view");

            expect(primaryMeasureBucket.title).toEqual("Measures");
            expect(secondaryMeasureBucket.title).toEqual("Measures");
            expect(viewBucket.title).toEqual("View by");
        });

        it("should set bucket subtitles & icons", () => {
            const referencePoint = setComboChartUiConfigDeprecated(
                refPointMock,
                intl,
                VisualizationTypes.COMBO,
            );
            const primaryMeasureBucket = get(referencePoint, "uiConfig.buckets.measures");
            const secondaryMeasureBucket = get(referencePoint, "uiConfig.buckets.secondary_measures");

            expect(primaryMeasureBucket.icon).toBeDefined();
            expect(secondaryMeasureBucket.icon).toBeDefined();
            expect(primaryMeasureBucket.subtitle).toEqual("Column");
            expect(secondaryMeasureBucket.subtitle).toEqual("Line");
        });
    });
});
