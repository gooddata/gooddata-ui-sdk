// (C) 2023-2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { fireEvent, screen, render, waitFor } from "@testing-library/react";

import { AttributeFilterButtonErrorTooltip } from "../AttributeFilterButtonErrorTooltip.js";

describe("Test AttributeFilterButtonErrorTooltip", () => {
    function renderComponent(errorMessage = "") {
        return render(
            <AttributeFilterButtonErrorTooltip errorMessage={errorMessage}>
                <p>Child component!</p>
            </AttributeFilterButtonErrorTooltip>,
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
