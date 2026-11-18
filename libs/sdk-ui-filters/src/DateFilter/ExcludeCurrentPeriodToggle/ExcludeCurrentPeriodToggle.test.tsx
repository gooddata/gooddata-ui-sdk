// (C) 2019-2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { ExcludeCurrentPeriodToggle } from "./ExcludeCurrentPeriodToggle.js";

describe("ExcludeCurrentPeriodToggle", () => {
    const renderWithDisabledValue = (disabled: boolean | undefined) => {
        const disabledProp = disabled === undefined ? null : { disabled };
        const props = {
            ...disabledProp,
            onChange: vi.fn(),
            value: true,
        };
        const Wrapped = withIntlForTest(ExcludeCurrentPeriodToggle);
        return render(<Wrapped {...props} />);
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

    it("should expose the visible label as the checkbox accessible name", () => {
        renderWithDisabledValue(false);
        const checkbox = screen.getByRole("checkbox", { name: "Exclude open period" });
        const labelledBy = checkbox.getAttribute("aria-labelledby");
        expect(document.getElementById(labelledBy!)).toHaveTextContent("Exclude open period");
    });

    it("should keep the accessible name when disabled", () => {
        renderWithDisabledValue(true);
        expect(screen.getByRole("checkbox", { name: "Exclude open period" })).toHaveAttribute(
            "aria-labelledby",
        );
    });

    it("should render a tooltip if disabled", async () => {
        renderWithDisabledValue(true);
        fireEvent.mouseOver(document.querySelector(".gd-bubble-trigger")!);

        await waitFor(() => {
            const bubble = document.querySelector(".gd-bubble");
            expect(bubble).toHaveTextContent("Not available for the selected date range");
        });
    });

    it("should not render a tooltip if enabled", async () => {
        renderWithDisabledValue(false);
        fireEvent.mouseOver(document.querySelector(".gd-bubble-trigger")!);

        await waitFor(() => {
            expect(screen.queryByText("Not available for the selected date range")).not.toBeInTheDocument();
        });
    });

    it("should have an accessible name matching the visible label", () => {
        const Wrapped = withIntlForTest(ExcludeCurrentPeriodToggle);
        render(<Wrapped value={false} onChange={vi.fn()} granularity="GDC.time.month" />);
        expect(screen.getByRole("checkbox", { name: "Exclude this month" })).toBeInTheDocument();
    });

    it("should describe the disabled checkbox with the unavailability reason", () => {
        renderWithDisabledValue(true);
        expect(screen.getByRole("checkbox")).toHaveAccessibleDescription(
            "Not available for the selected date range",
        );
    });

    it("should not have a description when enabled", () => {
        renderWithDisabledValue(false);
        expect(screen.getByRole("checkbox")).not.toHaveAttribute("aria-describedby");
    });
});
