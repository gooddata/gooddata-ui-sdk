// (C) 2019 GoodData Corporation
import { CHART_ORDER, getComboChartSeries, getComboChartStackingConfig } from "../comboChartOptions";
import { VisualizationTypes } from "../../../../../constants/visualizationTypes";
import { comboVizObjectContent, dummyMeasureGroup } from "../../../../../../__mocks__/fixtures";
import { IChartConfig, ISeriesItem } from "../../../../../interfaces/Config";
import { NORMAL_STACK, PERCENT_STACK } from "../../highcharts/getOptionalStackingConfiguration";

const { COLUMN, LINE, AREA, BAR } = VisualizationTypes;

describe("getComboChartSeries", () => {
    const series: ISeriesItem[] = [{}, {}];
    const baseConfig: IChartConfig = {
        mdObject: comboVizObjectContent,
    };

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
                {
                    ...baseConfig,
                    ...config,
                },
                dummyMeasureGroup,
                series,
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
                PERCENT_STACK,
            ),
        ).toBe(PERCENT_STACK);
    });

    it.each([[NORMAL_STACK, true], [null, false]])(
        "should return %s stack value when 'Stack Measures' config is %s",
        (stackValue: string | null, stackMeasures: boolean) => {
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
