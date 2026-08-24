// (C) 2023-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IFilterButtonCustomIcon } from "../../shared/interfaces/index.js";

import { DateFilterButton } from "./DateFilterButton.js";

describe("DateFilterButton", () => {
    const renderComponent = (params: { customIcon?: IFilterButtonCustomIcon } = {}) => {
        const defaultProps = {
            title: "Date filter",
            isMobile: false,
            ...params,
        };

        return render(<DateFilterButton {...defaultProps} />);
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
        expect(screen.getByText("Date filter")).toBeInTheDocument();
    });
});
