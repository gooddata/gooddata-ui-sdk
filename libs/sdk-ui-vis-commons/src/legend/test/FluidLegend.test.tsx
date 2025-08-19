// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { messagesMap, pickCorrectWording } from "@gooddata/sdk-ui";

import { FluidLegend } from "../FluidLegend.js";

describe("FluidLegend", () => {
    // Define locale and messages
    const DefaultLocale = "en-US";
    const messages = pickCorrectWording(messagesMap[DefaultLocale], {
        workspace: "mockWorkspace",
        enableRenamingMeasureToMetric: true,
    });

    function renderComponent(customProps: any = {}) {
        const props = {
            enableBorderRadius: false,
            series: [],
            onItemClick: noop,
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
        expect(screen.getAllByTestId("legend-item")).toHaveLength(3);
    });
});
