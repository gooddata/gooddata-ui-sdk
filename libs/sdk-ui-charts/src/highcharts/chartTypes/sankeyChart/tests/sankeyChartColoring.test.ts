// (C) 2023 GoodData Corporation
import { getMVSForViewByTwoAttributes } from "../../_util/test/helper.js";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { ColorFactory } from "../../_chartOptions/colorFactory.js";
import { SankeyChartColorStrategy } from "../sankeyChartColoring.js";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { CUSTOM_COLOR_PALETTE } from "../../_util/test/colorPalette.fixture.js";
import { CHART_TYPE, COLOR_MAPPINGS, RECORDS_WITHOUT_EMPTY_ATTRIBUTE } from "./sankeyChart.fixture.js";
import { describe, it, expect } from "vitest";

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
