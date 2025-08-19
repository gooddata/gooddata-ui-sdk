// (C) 2019-2025 GoodData Corporation
import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { ILegendAxisIndicatorProps, LegendAxisIndicator } from "../LegendAxisIndicator.js";

describe("LegendAxisIndicator", () => {
    function createComponent(props: ILegendAxisIndicatorProps) {
        const Wrapped = withIntl(LegendAxisIndicator);

        return render(<Wrapped {...props} />);
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
