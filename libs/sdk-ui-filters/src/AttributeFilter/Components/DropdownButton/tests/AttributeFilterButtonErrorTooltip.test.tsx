// (C) 2023-2025 GoodData Corporation
import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen, render, waitFor } from "@testing-library/react";

import { AttributeFilterButtonErrorTooltip } from "../AttributeFilterButtonErrorTooltip.js";
import { WithIntlForTest } from "@gooddata/sdk-ui";

/**
 * Mock BubbleHoverTrigger and Bubble to avoid test hangs after React 19 upgrade.
 *
 * The AttributeFilterButtonErrorTooltip component uses BubbleHoverTrigger + Bubble components for tooltip functionality.
 * After React 19 upgrade, the complex DOM event handling and positioning logic in BubbleHoverTrigger
 * became incompatible with the JSDOM test environment, causing tests to hang during component initialization.
 *
 * React 19 changed component initialization and effect scheduling, making the async hover logic,
 * DOM positioning calculations, and event handling problematic in tests. This mock provides the same
 * DOM structure for testing without the complex interactions that cause hangs.
 */
vi.mock("@gooddata/sdk-ui-kit", async () => {
    const actual = await vi.importActual("@gooddata/sdk-ui-kit");
    return {
        ...actual,
        BubbleHoverTrigger: ({ children }: { children: React.ReactNode }) => (
            <div className="gd-bubble-trigger">{children}</div>
        ),
        Bubble: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={`gd-bubble ${className || ""}`}>{children}</div>
        ),
    };
});

describe("Test AttributeFilterButtonErrorTooltip", () => {
    function renderComponent(errorMessage = "") {
        return render(
            <WithIntlForTest>
                <AttributeFilterButtonErrorTooltip errorMessage={errorMessage}>
                    <p>Child component!</p>
                </AttributeFilterButtonErrorTooltip>
            </WithIntlForTest>,
        );
    }

    it("should not render the tooltip if there is no error", () => {
        const { container } = renderComponent("");

        expect(container.getElementsByClassName("gd-attribute-filter-button-wrapper")).toHaveLength(0);
        expect(document.querySelector("p")).toHaveTextContent("Child component!");
    });

    it("should render the tooltip if there is an error", async () => {
        const { container } = renderComponent("Unknown error");

        expect(container.getElementsByClassName("gd-attribute-filter-button-wrapper")).toHaveLength(1);

        fireEvent.mouseEnter(document.querySelector(".gd-bubble-trigger")!);

        await waitFor(() => {
            expect(screen.queryByText("Error. Values cannot be loaded.")).toBeInTheDocument();
        });
    });
});
