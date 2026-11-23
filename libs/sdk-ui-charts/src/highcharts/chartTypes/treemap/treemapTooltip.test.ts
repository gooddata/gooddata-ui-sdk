// (C) 2026 GoodData Corporation

import Highcharts from "highcharts/esm/highcharts.js";
import "highcharts/esm/modules/treemap.js";
import { describe, expect, it } from "vitest";

import { type DataViewFacade } from "@gooddata/sdk-ui";

import {
    treemapWithMetricAndViewByAttribute,
    treemapWithMetricViewByAndStackByAttribute,
} from "../../../testUtils/charts.fixtures.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { type IUnsafeHighchartsTooltipPoint } from "../../typings/unsafe.js";
import { generateChartOptions } from "../_util/helper.js";

interface IHoveredLeaf {
    name: string;
    parentName: string;
    tooltipValues: string[];
}

function tooltipValues(tooltipHtml: string | null): string[] {
    const tooltip = document.createElement("div");
    tooltip.innerHTML = tooltipHtml ?? "";
    return Array.from(tooltip.querySelectorAll(".gd-viz-tooltip-value")).map(
        (value) => value.textContent ?? "",
    );
}

function hoverEveryLeaf(dv: DataViewFacade): IHoveredLeaf[] {
    const chartOptions = generateChartOptions(dv, { type: "treemap" });
    const container = document.createElement("div");
    document.body.appendChild(container);

    const options: HighchartsOptions = {
        chart: { width: 800, height: 600, animation: false },
        accessibility: { enabled: false },
        series: chartOptions.data!.series!.map((series: object) => ({ ...series, type: "treemap" })),
    };
    const chart = new Highcharts.Chart(container, options);

    try {
        const points = chart.series[0].points as unknown as IUnsafeHighchartsTooltipPoint[];

        return points
            .filter((point) => point.node?.isLeaf)
            .map((point) => ({
                name: point.name ?? "",
                parentName: points.find((candidate) => candidate.id === point.parent)?.name ?? "",
                tooltipValues: tooltipValues(chartOptions.actions!.tooltip!(point, 1000)),
            }));
    } finally {
        chart.destroy();
        container.remove();
    }
}

describe("treemap tooltip rendered by Highcharts", () => {
    it("shows each rectangle's own View by value when Segment by is empty", () => {
        const leaves = hoverEveryLeaf(treemapWithMetricAndViewByAttribute);

        expect(leaves.length).toBeGreaterThan(1);
        expect(leaves.map((leaf) => leaf.tooltipValues[0])).toEqual(leaves.map((leaf) => leaf.name));
    });

    it("shows each rectangle's own View by and Segment by values when both are set", () => {
        const leaves = hoverEveryLeaf(treemapWithMetricViewByAndStackByAttribute);

        expect(leaves.length).toBeGreaterThan(1);
        expect(leaves.map((leaf) => leaf.tooltipValues.slice(0, 2))).toEqual(
            leaves.map((leaf) => [leaf.parentName, leaf.name]),
        );
    });
});
