// (C) 2019-2023 GoodData Corporation
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ExcludeCurrentPeriodToggle } from "../ExcludeCurrentPeriodToggle.js";
import { withIntl } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";

describe("ExcludeCurrentPeriodToggle", () => {
    const renderWithDisabledValue = (disabled: boolean | undefined) => {
        const disabledProp = disabled === undefined ? null : { disabled };
        const props = {
            ...disabledProp,
            onChange: vi.fn(),
            value: true,
        };
        const Wrapped = withIntl(ExcludeCurrentPeriodToggle);
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
