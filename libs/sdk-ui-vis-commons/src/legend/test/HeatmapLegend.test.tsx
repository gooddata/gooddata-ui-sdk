// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { HeatmapLegend, IHeatmapLegendProps } from "../HeatmapLegend.js";
import { IHeatmapLegendItem, IColorLegendSize } from "../types.js";
import { describe, it, expect } from "vitest";

describe("HeatmapLegend", () => {
    function renderLegend(props: IHeatmapLegendProps) {
        return render(<HeatmapLegend {...props} />);
    }

    const defaultNumericSymbols = ["k", "M", "G"];
    const defaultSeries = [
        {
            color: "abc",
            legendIndex: 0,
            range: {
                from: 1,
                to: 2,
            },
        },
        {
            color: "def",
            legendIndex: 1,
            range: {
                from: 4,
                to: 5,
            },
        },
    ];

    const legendSizes: [IColorLegendSize, IHeatmapLegendItem[], string[], string][] = [
        ["small", defaultSeries, defaultNumericSymbols, "top"],
        ["medium", defaultSeries, defaultNumericSymbols, "top"],
        ["large", defaultSeries, defaultNumericSymbols, "top"],
    ];

    it.each(legendSizes)(
        "should render legend when size is %s",
        (
            size: IColorLegendSize,
            series: IHeatmapLegendItem[],
            numericSymbols: string[],
            position: string,
        ) => {
            renderLegend({ series, numericSymbols, size, position });

            expect(screen.getByLabelText("Color legend")).toBeInTheDocument();
        },
    );
});
