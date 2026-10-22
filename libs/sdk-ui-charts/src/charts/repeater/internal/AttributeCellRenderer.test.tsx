// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { AttributeCellRenderer, type IAttributeColumnData } from "./RepeaterChart.js";

function renderCell(data: Partial<IAttributeColumnData>) {
    const attributeColumnData: IAttributeColumnData = {
        attributeLocalId: "a1",
        value: null,
        formattedValue: null,
        renderingType: "text",
        config: undefined,
        ...data,
    };

    return render(
        <IntlProvider locale="en-US">
            <AttributeCellRenderer attributeColumnData={attributeColumnData} isLoading={false} />
        </IntlProvider>,
    );
}

describe("repeater attribute cell", () => {
    it("shows the formatted value of a text cell", () => {
        renderCell({ value: "1234.5", formattedValue: "1 234,5", renderingType: "text" });

        expect(screen.getByText("1 234,5")).toBeTruthy();
        expect(screen.queryByText("1234.5")).toBeNull();
    });

    it("links a hyperlink cell to the raw value, not the formatted one", () => {
        const { container } = renderCell({
            value: "https://example.com/2011-4",
            formattedValue: "Q4 2011",
            renderingType: "hyperlink",
        });

        expect(container.querySelector("a")?.getAttribute("href")).toBe("https://example.com/2011-4");
    });

    it("loads an image cell from the raw value, not the formatted one", () => {
        const { container } = renderCell({
            value: "https://example.com/img.png",
            formattedValue: "img",
            renderingType: "image",
        });

        expect(container.querySelector("img")?.getAttribute("src")).toBe("https://example.com/img.png");
    });
});
