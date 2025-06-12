// (C) 2023 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { generateTooltipSankeyChartFn } from "../../_chartOptions/chartTooltips.js";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { getMVSForViewByTwoAttributes } from "../../_util/test/helper.js";
import { DEFAULT_TOOLTIP_CONTENT_WIDTH } from "./sankeyChart.fixture.js";
import cloneDeep from "lodash/cloneDeep.js";
import { describe, it, expect } from "vitest";

describe("SankeyChart tooltip", () => {
    it("should render tooltip for node correctly", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.SankeyChart.MeasureAttributeFromAndAttributeTo,
        );
        const { measureGroup, viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);
        const tooltipFn = generateTooltipSankeyChartFn(
            viewByAttribute,
            viewByParentAttribute,
            measureGroup.items[0],
        );

        const tooltip = tooltipFn(
            {
                isNode: true,
                sum: 20,
                name: "Explorer",
            },
            DEFAULT_TOOLTIP_CONTENT_WIDTH,
        );
        expect(tooltip).toMatchSnapshot();
    });

    it("should render tooltip for node correctly ( show in percent )", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.SankeyChart.MeasureAttributeFromAndAttributeTo,
        );
        const { measureGroup, viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);
        const measureItem = cloneDeep(measureGroup.items[0]);
        measureItem.measureHeaderItem.format = "#,##0.00%";
        const tooltipFn = generateTooltipSankeyChartFn(viewByAttribute, viewByParentAttribute, measureItem);

        const tooltip = tooltipFn(
            {
                isNode: true,
                sum: 0.2,
                name: "Explorer",
            },
            DEFAULT_TOOLTIP_CONTENT_WIDTH,
        );
        expect(tooltip).toMatchSnapshot();
    });

    it("should render tooltip for connection correctly", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.SankeyChart.MeasureAttributeFromAndAttributeTo,
        );
        const { measureGroup, viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);
        const tooltipFn = generateTooltipSankeyChartFn(
            viewByAttribute,
            viewByParentAttribute,
            measureGroup.items[0],
        );

        const tooltip = tooltipFn(
            {
                isNode: false,
                weight: 12,
                from: "Explorer",
                to: "West coast",
            },
            DEFAULT_TOOLTIP_CONTENT_WIDTH,
        );
        expect(tooltip).toMatchSnapshot();
    });

    it("should render tooltip for connection correctly ( show in percent )", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.SankeyChart.MeasureAttributeFromAndAttributeTo,
        );
        const { measureGroup, viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);
        const measureItem = cloneDeep(measureGroup.items[0]);
        measureItem.measureHeaderItem.format = "#,##0.00%";
        const tooltipFn = generateTooltipSankeyChartFn(viewByAttribute, viewByParentAttribute, measureItem);

        const tooltip = tooltipFn(
            {
                isNode: false,
                weight: 0.12,
                from: "Explorer",
                to: "West coast",
            },
            DEFAULT_TOOLTIP_CONTENT_WIDTH,
        );
        expect(tooltip).toMatchSnapshot();
    });
});
