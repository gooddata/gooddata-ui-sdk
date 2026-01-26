// (C) 2023-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { CHART_TYPE, COLOR_MAPPINGS, RECORDS_WITHOUT_EMPTY_ATTRIBUTE } from "./sankeyChart.fixture.js";
import { recordedDataFacade } from "../../../../../testUtils/recordings.js";
import { ColorFactory } from "../../_chartOptions/colorFactory.js";
import { CUSTOM_COLOR_PALETTE } from "../../_util/test/colorPalette.fixture.js";
import { getMVSForViewByTwoAttributes } from "../../_util/test/helper.js";
import { SankeyChartColorStrategy } from "../sankeyChartColoring.js";

describe("SankeyChartColorStrategy", () => {
    it.each(RECORDS_WITHOUT_EMPTY_ATTRIBUTE)(
        "should return SankeyChartColorStrategy strategy in cases %s",
        (_title, record) => {
            const dv = recordedDataFacade(record);
            const { viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);

            const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
                undefined,
                undefined,
                viewByAttribute,
                viewByParentAttribute,
                null,
                dv,
                CHART_TYPE,
            );

            expect(colorStrategy).toBeInstanceOf(SankeyChartColorStrategy);
        },
    );

    it.each(RECORDS_WITHOUT_EMPTY_ATTRIBUTE)(
        "should return correct colors for each attribute header items in cases %s",
        (_title, record) => {
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

            expect(colorStrategy.getColorAssignment()).toMatchSnapshot();
        },
    );

    it.each(RECORDS_WITHOUT_EMPTY_ATTRIBUTE)(
        "should return correct colors for each attribute header items when color mapping in cases %s",
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

            expect(colorStrategy.getColorAssignment()).toMatchSnapshot();
        },
    );
});
