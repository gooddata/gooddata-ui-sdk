// (C) 2007-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { FluidLegend, type IFluidLegendProps } from "../FluidLegend.js";
import { type IPushpinCategoryLegendItem, type ISeriesItem } from "../types.js";

describe("FluidLegend", () => {
    const DefaultLocale = "en-US";
    const messages = DEFAULT_MESSAGES[DefaultLocale];

    function renderComponent(customProps: Partial<IFluidLegendProps> = {}) {
        const props = {
            enableBorderRadius: false,
            series: [],
            onItemClick: () => {},
            containerWidth: 500,
            ...customProps,
        };
        return render(
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
                <FluidLegend {...props} />
            </IntlProvider>,
        );
    }

    it("should render items", () => {
        const series: ISeriesItem[] = [
            {
                type: "line",
                legendIndex: 0,
                name: "A",
                color: "#333",
                isVisible: true,
            },
            {
                type: "line",
                legendIndex: 1,
                name: "B",
                color: "#333",
                isVisible: true,
            },
            {
                type: "line",
                legendIndex: 2,
                name: "A",
                color: "#333",
                isVisible: true,
            },
        ];

        renderComponent({ series: series as unknown as IPushpinCategoryLegendItem[] });
        expect(screen.getAllByTestId("legend-item")).toHaveLength(3);
    });
});
