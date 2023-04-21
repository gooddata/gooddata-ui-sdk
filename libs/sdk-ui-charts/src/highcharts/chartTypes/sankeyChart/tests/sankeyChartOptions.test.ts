// (C) 2023 GoodData Corporation
import { recordedDataFacade } from "../../../../../__mocks__/recordings";
import { getMVSForViewByTwoAttributes } from "../../_util/test/helper";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { ColorFactory } from "../../_chartOptions/colorFactory";
import { CUSTOM_COLOR_PALETTE } from "../../_util/test/colorPalette.fixture";
import { buildSankeyChartSeries } from "../sankeyChartOptions";
import { CHART_TYPE, COLOR_MAPPINGS, EMPTY_HEADER_TITLE_VALUE, RECORDS } from "./sankeyChart.fixture";

describe("SankeyChart buildSankeyChartSeries", () => {
    it.each(RECORDS)("should return series correctly in cases %s ", (_title, record) => {
        const dv = recordedDataFacade(record);
        const { viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);
        const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
            CUSTOM_COLOR_PALETTE,
            undefined,
            viewByAttribute,
            viewByParentAttribute,
            null,
            dv,
            CHART_TYPE,
        );
        const series = buildSankeyChartSeries(
            dv,
            [viewByParentAttribute, viewByAttribute],
            colorStrategy.getColorAssignment(),
            CUSTOM_COLOR_PALETTE,
            EMPTY_HEADER_TITLE_VALUE,
        );
        expect(series).toMatchSnapshot();
    });

    it.each(RECORDS)(
        "should return series correctly with custom color mappings in cases %s ",
        (_title, record) => {
            const dv = recordedDataFacade(record);
            const { viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);

            const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                COLOR_MAPPINGS,
                viewByAttribute,
                viewByParentAttribute,
                null,
                dv,
                CHART_TYPE,
            );
            const series = buildSankeyChartSeries(
                dv,
                [viewByParentAttribute, viewByAttribute],
                colorStrategy.getColorAssignment(),
                CUSTOM_COLOR_PALETTE,
                EMPTY_HEADER_TITLE_VALUE,
            );
            expect(series).toMatchSnapshot();
        },
    );
});
