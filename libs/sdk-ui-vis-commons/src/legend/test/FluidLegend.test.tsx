// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { FluidLegend } from "../FluidLegend.js";
import { describe, it, expect } from "vitest";

describe("FluidLegend", () => {
    function renderComponent(customProps: any = {}) {
        const props = {
            enableBorderRadius: false,
            series: [],
            onItemClick: noop,
            containerWidth: 500,
            ...customProps,
        };
        return render(<FluidLegend {...props} />);
    }

    it("should render items", () => {
        const series = [
            {
                name: "A",
                color: "#333",
                isVisible: true,
            },
            {
                name: "B",
                color: "#333",
                isVisible: true,
            },
            {
                name: "A",
                color: "#333",
                isVisible: true,
            },
        ];

        renderComponent({ series });
        expect(screen.getAllByLabelText("Legend item")).toHaveLength(3);
    });
});
