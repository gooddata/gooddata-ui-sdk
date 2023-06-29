// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { ILegendListProps, LegendList } from "../LegendList.js";
import noop from "lodash/noop.js";
import { withIntl } from "@gooddata/sdk-ui";
import { LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR } from "../helpers.js";
import { describe, it, expect } from "vitest";

describe("LegendList", () => {
    function renderComponent(customProps: Partial<ILegendListProps> = {}) {
        const props: ILegendListProps = {
            enableBorderRadius: false,
            series: [],
            onItemClick: noop,
            ...customProps,
        };

        const Wrapped = withIntl(LegendList);

        return render(<Wrapped {...props} />);
    }

    it("should render legend items, indicators and separator", () => {
        const series = [
            {
                type: LEGEND_AXIS_INDICATOR,
                labelKey: "left",
            },
            {
                name: "A",
                color: "#333",
                isVisible: true,
                yAxis: 0,
            },
            {
                type: LEGEND_SEPARATOR,
            },
            {
                name: "B",
                color: "#333",
                isVisible: true,
                yAxis: 0,
            },
            {
                type: LEGEND_AXIS_INDICATOR,
                labelKey: "right",
            },
            {
                name: "A",
                color: "#333",
                isVisible: true,
                yAxis: 1,
            },
        ];

        expect(series).toHaveLength(6);

        renderComponent({ series });

        expect(screen.getAllByLabelText("Legend item")).toHaveLength(3);
        expect(screen.getAllByLabelText("Legend separator")).toHaveLength(1);
        expect(screen.getAllByLabelText("Legend axis indicator")).toHaveLength(2);
    });
});
