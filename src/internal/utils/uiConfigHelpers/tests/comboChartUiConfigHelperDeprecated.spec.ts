// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import * as referencePointMock from "../../../mocks/referencePointMocks";
import { setComboChartUiConfigDeprecated } from "../comboChartUiConfigHelperDeprecated";
import { createInternalIntl } from "../../internalIntlProvider";
import { COMBO_CHART_UICONFIG_DEPRECATED } from "../../../constants/uiConfig";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";
import { DEFAULT_LOCALE } from "../../../../constants/localization";

describe("comboChartUiConfigHelper", () => {
    describe("setComboChartUiConfigDeprecated", () => {
        const intl = createInternalIntl(DEFAULT_LOCALE);
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
