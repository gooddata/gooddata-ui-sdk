// (C) 2019-2025 GoodData Corporation
import { render, screen } from "@testing-library/react";
import { ILegendAxisIndicatorProps, LegendAxisIndicator } from "../LegendAxisIndicator.js";
import { describe, it, expect } from "vitest";

describe("LegendAxisIndicator", () => {
    function createComponent(props: ILegendAxisIndicatorProps) {
        return render(<LegendAxisIndicator {...props} />);
    }

    it.each([
        ["left", [], "Left:"],
        ["right", [], "Right:"],
        ["combo", ["column", "left"], "Column (Left):"],
        ["combo", ["area", "right"], "Area (Right):"],
    ])(
        "should render legend indicator when labelKey=%s",
        (labelKey: string, data: string[], text: string) => {
            createComponent({ labelKey, data });
            expect(screen.getByText(text)).toBeInTheDocument();
        },
    );
});
