// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import * as referencePointMock from "../../../mocks/referencePointMocks";
import { setComboChartUiConfig } from "../comboChartUiConfigHelper";
import { createInternalIntl } from "../../internalIntlProvider";
import { COMBO_CHART_UICONFIG } from "../../../constants/uiConfig";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";
import { DEFAULT_LOCALE } from "../../../../constants/localization";

describe("comboChartUiConfigHelper", () => {
    describe("setComboChartUiConfig", () => {
        const intl = createInternalIntl(DEFAULT_LOCALE);
        const refPointMock = {
            ...referencePointMock.twoMeasureBucketsReferencePoint,
            uiConfig: COMBO_CHART_UICONFIG,
        };
        const { COLUMN, LINE, AREA } = VisualizationTypes;

        it("should set bucket titles", () => {
            const referencePoint = setComboChartUiConfig(refPointMock, intl, VisualizationTypes.COMBO);
            const primaryMeasureBucket = get(referencePoint, "uiConfig.buckets.measures");
            const secondaryMeasureBucket = get(referencePoint, "uiConfig.buckets.secondary_measures");
            const viewBucket = get(referencePoint, "uiConfig.buckets.view");

            expect(primaryMeasureBucket.title).toEqual("Measures");
            expect(secondaryMeasureBucket.title).toEqual("Measures");
            expect(viewBucket.title).toEqual("View by");
        });

        it.each([
            [undefined, undefined, "as columns", "as lines"],
            [COLUMN, AREA, "as columns", "as areas"],
            [LINE, LINE, "as lines", "as lines"],
        ])(
            "should set bucket subtitles & icons when primary chart type is %s and secondary chart type is %s",
            (primaryChartType, secondaryChartType, primarySubtitle, secondarySubtitle) => {
                const refPoint = {
                    ...refPointMock,
                    properties: {
                        controls: {
                            primaryChartType,
                            secondaryChartType,
                        },
                    },
                };
                const referencePoint = setComboChartUiConfig(refPoint, intl, VisualizationTypes.COMBO);
                const primaryMeasureBucket = get(referencePoint, "uiConfig.buckets.measures");
                const secondaryMeasureBucket = get(referencePoint, "uiConfig.buckets.secondary_measures");

                expect(primaryMeasureBucket.icon).toBeDefined();
                expect(secondaryMeasureBucket.icon).toBeDefined();
                expect(primaryMeasureBucket.subtitle).toEqual(primarySubtitle);
                expect(secondaryMeasureBucket.subtitle).toEqual(secondarySubtitle);
            },
        );

        it.each([[true, true], [false, false]])(
            "should set canStackInPercent as %s when dual axis is %s",
            (expectation: boolean, dualAxis: boolean) => {
                const refPoint = {
                    ...refPointMock,
                    properties: {
                        controls: {
                            dualAxis,
                            primaryChartType: COLUMN,
                            secondaryChartType: LINE,
                        },
                    },
                };
                const referencePoint = setComboChartUiConfig(refPoint, intl, VisualizationTypes.COMBO);
                const canStackInPercent = get(referencePoint, "uiConfig.optionalStacking.canStackInPercent");
                expect(canStackInPercent).toBe(expectation);
            },
        );
    });
});
