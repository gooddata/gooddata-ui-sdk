// (C) 2023-2025 GoodData Corporation
import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { DEFAULT_TOOLTIP_CONTENT_WIDTH } from "./sankeyChart.fixture.js";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { generateTooltipSankeyChartFn } from "../../_chartOptions/chartTooltips.js";
import { getMVSForViewByTwoAttributes } from "../../_util/test/helper.js";

describe("SankeyChart tooltip", () => {
    it("should render tooltip for node correctly", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.SankeyChart
                .MeasureAttributeFromAndAttributeTo as unknown as ScenarioRecording,
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
            ReferenceRecordings.Scenarios.SankeyChart
                .MeasureAttributeFromAndAttributeTo as unknown as ScenarioRecording,
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
            ReferenceRecordings.Scenarios.SankeyChart
                .MeasureAttributeFromAndAttributeTo as unknown as ScenarioRecording,
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
            ReferenceRecordings.Scenarios.SankeyChart
                .MeasureAttributeFromAndAttributeTo as unknown as ScenarioRecording,
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
