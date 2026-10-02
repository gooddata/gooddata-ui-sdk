// (C) 2019-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { VisualizationTypes } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../testUtils/recordings.fixture.js";
import { type StackingType } from "../../constants/stacking.js";
import { type ISeriesItem } from "../../typings/unsafe.js";

import { CHART_ORDER, getComboChartSeries, getComboChartStackingConfig } from "./comboChartOptions.js";

const { COLUMN, LINE, AREA, BAR } = VisualizationTypes;

const ComboChart = recordedDataFacade(
    ReferenceRecordings.Scenarios.ComboChart
        .OnePrimaryAndSecondaryMeasureWithViewBy as unknown as ScenarioRecording,
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

    it("should remove line style and width from column series and keep them on line series", () => {
        const styledSeries: ISeriesItem[] = [
            { dashStyle: "dash", lineWidth: 4 },
            { dashStyle: "dash", lineWidth: 1 },
        ];

        const result = getComboChartSeries(
            {},
            ComboMeasureGroup!.measureGroupHeader,
            styledSeries,
            ComboChart,
        );

        expect(result).toEqual([
            { type: COLUMN, zIndex: CHART_ORDER[COLUMN] },
            { type: LINE, zIndex: CHART_ORDER[LINE], dashStyle: "dash", lineWidth: 1 },
        ]);
    });

    it("should keep line style and width on area series and remove them from column series", () => {
        const styledSeries: ISeriesItem[] = [
            { dashStyle: "dash", lineWidth: 4 },
            { dashStyle: "dash", lineWidth: 1 },
        ];

        const result = getComboChartSeries(
            { primaryChartType: AREA, secondaryChartType: COLUMN },
            ComboMeasureGroup!.measureGroupHeader,
            styledSeries,
            ComboChart,
        );

        expect(result).toEqual([
            { type: AREA, zIndex: CHART_ORDER[AREA], dashStyle: "dash", lineWidth: 4 },
            { type: COLUMN, zIndex: CHART_ORDER[COLUMN] },
        ]);
    });
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

    it.each<[StackingType, boolean]>([
        ["normal", true],
        [null, false],
    ])("should return %s stack value when 'Stack Measures' config is %s", (stackValue, stackMeasures) => {
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
    });
});
