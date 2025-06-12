// (C) 2020-2025 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { ColorLegend, IColorLegendProps } from "../ColorLegend.js";
import range from "lodash/range.js";
import { describe, it, expect } from "vitest";

describe("ColorLegend", () => {
    function renderLegend(props: IColorLegendProps) {
        return render(<ColorLegend {...props} />);
    }

    it("should not render color legend with empty data", () => {
        renderLegend({ data: [], numericSymbols: ["k", "M", "G"], position: "top" });

        expect(screen.queryByTestId("color-legend")).not.toBeInTheDocument();
        expect(screen.queryByTestId("color-legend-boxes")).not.toBeInTheDocument();
        expect(screen.queryByTestId("color-legend-labels")).not.toBeInTheDocument();
    });

    it("should render color legend", () => {
        const data = range(0, 6).map((itemId) => ({
            color: "color" + itemId,
            range: {
                from: itemId,
                to: itemId + 1,
            },
        }));
        const numericSymbols = ["k", "M", "G"];
        renderLegend({ data, numericSymbols, position: "top" });

        const boxes = screen.getByTestId("color-legend-boxes");
        const labels = screen.getByTestId("color-legend-labels");
        expect(screen.getByTestId("color-legend")).toBeInTheDocument();
        expect(boxes).toBeInTheDocument();
        expect(labels).toBeInTheDocument();

        expect(labels.querySelectorAll("span")).toHaveLength(11); // 7 label text; 4 space
        expect(boxes.querySelectorAll("span")).toHaveLength(6);
    });
});
