// (C) 2007-2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { type IPopUpLegendProps, PopUpLegend } from "../PopUpLegend/PopUpLegend.js";
import { type IPushpinCategoryLegendItem } from "../types.js";

describe("PopUpLegend", () => {
    function renderComponent(customProps: Partial<IPopUpLegendProps> = {}) {
        const props: IPopUpLegendProps = {
            enableBorderRadius: false,
            series: [],
            name: "properties.legend.title",
            maxRows: 1,
            onLegendItemClick: () => {},
            containerId: "",
            ...customProps,
        };
        const Wrapped = withIntl(PopUpLegend);

        return render(<Wrapped {...props} />);
    }

    it("should render items", () => {
        const series: IPushpinCategoryLegendItem[] = [
            { type: "line", name: "A", color: "#333", isVisible: true, uri: "/url", legendIndex: 0 },
            {
                type: "line",
                name: "B",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
            {
                type: "line",
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
