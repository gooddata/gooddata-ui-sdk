// (C) 2023-2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { AttributeFilterButtonErrorTooltip } from "./AttributeFilterButtonErrorTooltip.js";

describe("Test AttributeFilterButtonErrorTooltip", () => {
    function renderComponent(errorMessage = "") {
        const Wrapped = withIntlForTest(AttributeFilterButtonErrorTooltip);
        return render(
            <Wrapped errorMessage={errorMessage}>
                <p>Child component!</p>
            </Wrapped>,
        );
    }

    it("should not render the tooltip if there is no error", () => {
        const { container } = renderComponent("");

        expect(container.getElementsByClassName("gd-attribute-filter-button-wrapper")).toHaveLength(0);
        expect(document.querySelector("p")).toHaveTextContent("Child component!");
    });

    it("should render the tooltip if there is no error", async () => {
        const { container } = renderComponent("Unknown error");

        expect(container.getElementsByClassName("gd-attribute-filter-button-wrapper")).toHaveLength(1);

        fireEvent.mouseEnter(document.querySelector(".gd-bubble-trigger")!);

        await waitFor(() => {
            expect(screen.queryByText("Error. Values cannot be loaded.")).toBeInTheDocument();
        });
    });
});
