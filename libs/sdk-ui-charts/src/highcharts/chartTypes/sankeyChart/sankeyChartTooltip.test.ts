// (C) 2023-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { recordedDataFacade } from "../../../testUtils/recordings.fixture.js";
import { generateTooltipSankeyChartFn } from "../_chartOptions/chartTooltips.js";
import { getMVSForViewByTwoAttributes } from "../_util/helper.js";

import { DEFAULT_TOOLTIP_CONTENT_WIDTH } from "./sankeyChart.test.helpers.js";

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

    it("should show the node names, not the node ids, in the tooltip for connection", () => {
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
                from: "1.234",
                to: "1.2349",
                fromNode: { name: "1.23 from" },
                toNode: { name: "1.23 to" },
            },
            DEFAULT_TOOLTIP_CONTENT_WIDTH,
        );

        expect(tooltip).toContain("1.23 from");
        expect(tooltip).toContain("1.23 to");
        expect(tooltip).not.toContain("1.234");
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
