// (C) 2023-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { type IFilterButtonCustomIcon } from "../../shared/interfaces/index.js";

import { DateFilterButton } from "./DateFilterButton.js";

const WrappedDateFilterButton = withIntlForTest(DateFilterButton);

describe("DateFilterButton", () => {
    const renderComponent = (
        params: { customIcon?: IFilterButtonCustomIcon; disabled?: boolean; onKeyDown?: () => void } = {},
    ) => {
        const { onKeyDown, ...rest } = params;
        const defaultProps = {
            title: "Date range",
            isMobile: false,
            children: <span>All time</span>,
            ...rest,
        };

        return render(
            <div onKeyDown={onKeyDown}>
                <WrappedDateFilterButton {...defaultProps} />
            </div>,
        );
    };

    it("should render custom icon", () => {
        const customIcon: IFilterButtonCustomIcon = {
            icon: "gd-icon-lock",
            tooltip: "tooltip",
        };

        const { container } = renderComponent({ customIcon });

        expect(container.querySelector(".s-gd-filter-button-custom-icon-wrapper")).toBeInTheDocument();
        expect(container.querySelector(".s-gd-filter-button-custom-icon")).toHaveClass(customIcon.icon);
    });

    it("should not render custom icon when it is not provided", () => {
        const { container } = renderComponent();

        expect(container.querySelector(".s-gd-filter-button-custom-icon-wrapper")).toBeFalsy();
        expect(screen.getByText("Date range")).toBeInTheDocument();
    });

    it("should expose locked state and description when disabled", () => {
        renderComponent({ disabled: true });

        const button = screen.getByRole("button", { name: "Date range All time" });
        expect(button).toHaveAttribute("aria-disabled", "true");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
        expect(button).toHaveAttribute("tabindex", "0");
        expect(button).toHaveAccessibleDescription("This filter is locked");
    });

    it("should stop Enter and Space when disabled", () => {
        const onKeyDown = vi.fn();
        renderComponent({ disabled: true, onKeyDown });

        const button = screen.getByRole("button");
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        fireEvent.keyDown(button, { key: " ", code: "Space" });

        expect(onKeyDown).not.toHaveBeenCalled();
    });

    it("should not expose locked state when enabled", () => {
        renderComponent();

        const button = screen.getByRole("button", { name: "Date range All time" });
        expect(button).not.toHaveAttribute("aria-disabled");
        expect(button).not.toHaveAttribute("aria-describedby");
        expect(screen.queryByText("This filter is locked")).not.toBeInTheDocument();
    });
});
