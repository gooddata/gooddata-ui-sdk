// (C) 2019 GoodData Corporation
import { CHART_ORDER, getComboChartSeries } from "../comboChartOptions";
import { VisualizationTypes } from "../../../../../constants/visualizationTypes";
import { comboVizObjectContent, dummyMeasureGroup } from "../../../../../../__mocks__/fixtures";
import { IChartConfig, ISeriesItem } from "../../../../../interfaces/Config";

describe("getComboChartSeries", () => {
    const { COLUMN, LINE, AREA, BAR } = VisualizationTypes;
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
