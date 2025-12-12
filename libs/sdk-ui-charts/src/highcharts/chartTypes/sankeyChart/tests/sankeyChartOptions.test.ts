// (C) 2023-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { CHART_TYPE, COLOR_MAPPINGS, EMPTY_HEADER_TITLE_VALUE, RECORDS } from "./sankeyChart.fixture.js";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { ColorFactory } from "../../_chartOptions/colorFactory.js";
import { CUSTOM_COLOR_PALETTE } from "../../_util/test/colorPalette.fixture.js";
import { getMVSForViewByTwoAttributes } from "../../_util/test/helper.js";
import { buildSankeyChartSeries } from "../sankeyChartOptions.js";

describe("SankeyChart buildSankeyChartSeries", () => {
    it.each(RECORDS)("should return series correctly in cases %s", (_title, record) => {
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
            colorStrategy,
            EMPTY_HEADER_TITLE_VALUE,
        );
        expect(series).toMatchSnapshot();
    });

    it.each(RECORDS)(
        "should return series correctly with custom color mappings in cases %s",
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
                colorStrategy,
                EMPTY_HEADER_TITLE_VALUE,
            );
            expect(series).toMatchSnapshot();
        },
    );
});
