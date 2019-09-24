// (C) 2019 GoodData Corporation
import { comboFacade, dummyMeasureGroup } from "../../../../../__mocks__/fixtures";
import { VisualizationTypes } from "../../../../base/constants/visualizationTypes";
import { ISeriesItem } from "../../../Config";
import { NORMAL_STACK, PERCENT_STACK } from "../../highcharts/getOptionalStackingConfiguration";
import { CHART_ORDER, getComboChartSeries, getComboChartStackingConfig } from "../comboChartOptions";

const { COLUMN, LINE, AREA, BAR } = VisualizationTypes;

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
            const result = getComboChartSeries(config, dummyMeasureGroup, series, comboFacade);

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
