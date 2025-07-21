// (C) 2019-2025 GoodData Corporation
import { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ExcludeCurrentPeriodToggle } from "../ExcludeCurrentPeriodToggle.js";
import { describe, it, expect, vi } from "vitest";
import { WithIntlForTest } from "@gooddata/sdk-ui";

/**
 * Mock BubbleHoverTrigger and Bubble to prevent test hangs after React 19 upgrade.
 * ExcludeCurrentPeriodToggle uses these for tooltip functionality, but the complex DOM event handling
 * and positioning logic causes hangs in JSDOM test environment.
 */
vi.mock("@gooddata/sdk-ui-kit", async () => {
    const actual = await vi.importActual("@gooddata/sdk-ui-kit");
    return {
        ...actual,
        BubbleHoverTrigger: ({ children }: { children: ReactNode }) => (
            <div className="gd-bubble-trigger">{children}</div>
        ),
        Bubble: ({ children, className }: { children?: ReactNode; className?: string }) => {
            // Render children when present (for tooltip tests), otherwise hide the bubble
            return children ? (
                <div className={`gd-bubble ${className || ""}`}>{children}</div>
            ) : (
                <div className={`gd-bubble ${className || ""}`} style={{ display: "none" }} />
            );
        },
    };
});

describe("ExcludeCurrentPeriodToggle", () => {
    const renderWithDisabledValue = (disabled: boolean | undefined) => {
        const disabledProp = disabled === undefined ? null : { disabled };
        const props = {
            ...disabledProp,
            onChange: vi.fn(),
            value: true,
        };
        return render(
            <WithIntlForTest>
                <ExcludeCurrentPeriodToggle {...props} />
            </WithIntlForTest>,
        );
    };

    it('should be disabled when passed true as the value of the "disabled" prop', () => {
        renderWithDisabledValue(true);
        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it('should not be disabled when passed false as the value of the "disabled" prop', () => {
        renderWithDisabledValue(false);
        expect(screen.getByRole("checkbox")).not.toBeDisabled();
    });

    it('should not be disabled when not passed any value of the "disabled" prop', () => {
        renderWithDisabledValue(undefined);
        expect(screen.getByRole("checkbox")).not.toBeDisabled();
    });

    it("should render a tooltip if disabled", async () => {
        renderWithDisabledValue(true);
        fireEvent.mouseOver(document.querySelector(".gd-bubble-trigger"));

        await waitFor(() => {
            expect(screen.queryByText("Not available for the selected date range")).toBeInTheDocument();
        });
    });

    it("should not render a tooltip if enabled", async () => {
        renderWithDisabledValue(false);
        fireEvent.mouseOver(document.querySelector(".gd-bubble-trigger"));

        await waitFor(() => {
            expect(screen.queryByText("Not available for the selected date range")).not.toBeInTheDocument();
        });
    });
});
