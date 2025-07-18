// (C) 2007-2025 GoodData Corporation
import { render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { IPopUpLegendProps, PopUpLegend } from "../PopUpLegend/PopUpLegend.js";
import { IPushpinCategoryLegendItem } from "../types.js";
import { describe, it, expect } from "vitest";

describe("PopUpLegend", () => {
    function renderComponent(customProps: Partial<IPopUpLegendProps> = {}) {
        const props: IPopUpLegendProps = {
            enableBorderRadius: false,
            series: [],
            name: "properties.legend.title",
            maxRows: 1,
            onLegendItemClick: noop,
            containerId: "",
            ...customProps,
        };

        return render(<PopUpLegend {...props} />);
    }

    it("should render items", () => {
        const series: IPushpinCategoryLegendItem[] = [
            {
                name: "A",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
            {
                name: "B",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
            {
                name: "A",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
        ];

        renderComponent({ series });
        expect(screen.getAllByTestId("legend-item")).toHaveLength(3);
    });
});
