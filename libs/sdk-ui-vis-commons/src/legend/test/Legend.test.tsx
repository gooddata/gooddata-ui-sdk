// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { describe, expect, it } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { ILegendProps, Legend } from "../Legend.js";

describe("Legend", () => {
    const series = [
        {
            name: "series1",
            color: "#333333",
        },
        {
            name: "series2",
            color: "#222222",
        },
        {
            name: "series3",
            color: "#111111",
        },
        {
            name: "series4",
            color: "#000000",
        },
    ];

    function createComponent(userProps: Partial<ILegendProps> = {}) {
        const props: ILegendProps = {
            enableBorderRadius: false,
            series,
            onItemClick: noop,
            validateOverHeight: noop,
            position: "top",
            contentDimensions: { width: 440, height: 440 },
            ...userProps,
        };

        const Wrapped = withIntl(Legend);

        return render(<Wrapped {...props} />);
    }

    it("should render StaticLegend on desktop", () => {
        createComponent({
            showFluidLegend: false,
        });
        expect(document.querySelector(".viz-static-legend-wrap")).toBeInTheDocument();
    });

    it("should render fluid legend on mobile", () => {
        createComponent({
            showFluidLegend: true,
            responsive: true,
        });
        expect(document.querySelector(".viz-fluid-legend-wrap")).toBeInTheDocument();
    });

    it("should render heat map legend when type is heatmap", () => {
        createComponent({ heatmapLegend: true });
        expect(screen.getByTestId("color-legend")).toBeInTheDocument();
    });

    it("should render pop up legend when is set `autoPositionWithPopup`", () => {
        const responsiveWithPopup = "autoPositionWithPopup";
        createComponent({ responsive: responsiveWithPopup, maximumRows: 1 });
        expect(screen.getByTestId("pop-up-legend")).toBeInTheDocument();
    });
});
