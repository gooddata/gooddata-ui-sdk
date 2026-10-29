// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { type IChartOptions, type ISeriesDataItem } from "../typings/unsafe.js";

import { type IChartProps } from "./Chart.js";
import { HighChartsRenderer } from "./HighChartsRenderer.js";
import { buildLegendOptions } from "./legendBuilder.js";

const WrappedRenderer = withIntlForTest(HighChartsRenderer);

function renderVisiblePoints({ config }: IChartProps) {
    const points = (config.series![0] as { data: ISeriesDataItem[] }).data;
    return (
        <ul data-testid="visible-points">
            {points
                .filter((point) => point.visible)
                .map((point) => (
                    <li key={point.name}>{point.name}</li>
                ))}
        </ul>
    );
}

function createProps(firstLegendIndex: number, secondLegendIndex: number) {
    const chartOptions: IChartOptions = {
        type: "scatter",
        data: {
            series: [
                {
                    data: [
                        { name: "A", clusterName: "Cluster A", legendIndex: firstLegendIndex, color: "blue" },
                        {
                            name: "B",
                            clusterName: "Cluster B",
                            legendIndex: secondLegendIndex,
                            color: "green",
                        },
                    ],
                },
            ],
        },
    };
    return {
        chartOptions,
        hcOptions: {
            chart: { type: "scatter" },
            series: chartOptions.data!.series!,
            xAxis: [{}],
            yAxis: [{}],
        } as IChartProps["config"],
        legend: buildLegendOptions({}, chartOptions, undefined),
        chartRenderer: renderVisiblePoints,
        height: 400,
        width: 600,
        contentRect: { client: { width: 600, height: 400, top: 0, left: 0, right: 600, bottom: 400 } },
    };
}

describe("HighChartsRenderer scatter legend", () => {
    it("shows all clusters initially and toggles the matching cluster on the first click with gaps in legend indices", () => {
        render(<WrappedRenderer {...createProps(1, 3)} />);

        const clusterA = screen.getByRole("option", { name: "Cluster A" });
        const clusterB = screen.getByRole("option", { name: "Cluster B" });
        const visiblePoints = within(screen.getByTestId("visible-points"));
        expect(clusterA).toHaveAttribute("aria-selected", "true");
        expect(clusterB).toHaveAttribute("aria-selected", "true");

        fireEvent.click(clusterB);
        expect(clusterB).toHaveAttribute("aria-selected", "false");
        expect(visiblePoints.getByText("A")).toBeInTheDocument();
        expect(visiblePoints.queryByText("B")).not.toBeInTheDocument();

        fireEvent.click(clusterA);
        expect(visiblePoints.queryAllByRole("listitem")).toHaveLength(0);

        fireEvent.click(clusterB);
        expect(visiblePoints.queryByText("A")).not.toBeInTheDocument();
        expect(visiblePoints.getByText("B")).toBeInTheDocument();
    });

    it("resets visibility using the new legend indices when the chart data changes", () => {
        const { rerender } = render(<WrappedRenderer {...createProps(0, 1)} />);
        fireEvent.click(screen.getByRole("option", { name: "Cluster B" }));

        rerender(<WrappedRenderer {...createProps(1, 3)} />);

        const clusterB = screen.getByRole("option", { name: "Cluster B" });
        expect(screen.getByRole("option", { name: "Cluster A" })).toHaveAttribute("aria-selected", "true");
        expect(clusterB).toHaveAttribute("aria-selected", "true");
        fireEvent.click(clusterB);
        expect(within(screen.getByTestId("visible-points")).queryByText("B")).not.toBeInTheDocument();
    });
});
