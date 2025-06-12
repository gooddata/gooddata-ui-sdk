// (C) 2019-2021 GoodData Corporation
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { CHART_ORDER, getComboChartSeries, getComboChartStackingConfig } from "../comboChartOptions.js";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { StackingType } from "../../../constants/stacking.js";
import { ISeriesItem } from "../../../typings/unsafe.js";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { describe, it, expect } from "vitest";

const { COLUMN, LINE, AREA, BAR } = VisualizationTypes;

const ComboChart = recordedDataFacade(
    ReferenceRecordings.Scenarios.ComboChart.OnePrimaryAndSecondaryMeasureWithViewBy,
);
const ComboMeasureGroup = ComboChart.meta().measureGroupDescriptor();

describe("getComboChartSeries", () => {
    const series: ISeriesItem[] = [{}, {}];

    it.each`
        config                                                | primaryType | secondaryType
        ${{}}                                                 | ${COLUMN}   | ${LINE}
        ${{ secondaryChartType: AREA }}                       | ${COLUMN}   | ${AREA}
        ${{ secondaryChartType: COLUMN }}                     | ${COLUMN}   | ${COLUMN}
        ${{ primaryChartType: BAR, secondaryChartType: BAR }} | ${COLUMN}   | ${LINE}
    `(
        "should set $primaryType as primary type and $secondaryType as secondary type",
        ({ config, primaryType, secondaryType }) => {
            const result = getComboChartSeries(
                config,
                ComboMeasureGroup!.measureGroupHeader,
                series,
                ComboChart,
            );

            expect(result).toEqual([
                { type: primaryType, zIndex: CHART_ORDER[primaryType] },
                { type: secondaryType, zIndex: CHART_ORDER[secondaryType] },
            ]);
        },
    );
});

describe("getComboChartStackingConfig", () => {
    it("should return null when there is no stacking config", () => {
        expect(getComboChartStackingConfig({}, [], null)).toBe(null);
    });

    it("should return default 'percent' stack value", () => {
        expect(
            getComboChartStackingConfig(
                { stackMeasures: true },
                [
                    {
                        yAxis: 0,
                        type: COLUMN,
                    },
                    {
                        yAxis: 1,
                        type: LINE,
                    },
                ],
                "percent",
            ),
        ).toBe("percent");
    });

    it.each([
        ["normal", true],
        [null, false],
    ])(
        "should return %s stack value when 'Stack Measures' config is %s",
        (stackValue: StackingType | null, stackMeasures: boolean) => {
            expect(
                getComboChartStackingConfig(
                    { stackMeasures },
                    [
                        {
                            yAxis: 0,
                            type: COLUMN,
                        },
                        {
                            yAxis: 0,
                            type: LINE,
                        },
                    ],
                    stackValue,
                ),
            ).toBe(stackValue);
        },
    );
});
