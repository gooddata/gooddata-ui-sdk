// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { FilterButtonCustomIcon as mockFilterButtonCustomIcon } from "../../../../shared/components/internal/FilterButtonCustomIcon.js";
import {
    AttributeFilterDropdownButton,
    type IAttributeFilterDropdownButtonProps,
} from "../AttributeFilterDropdownButton.js";

vi.mock("../../../../shared/components/internal/FilterButtonCustomIcon.js", () => ({
    FilterButtonCustomIcon: vi.fn(() => null),
}));

const ATTRIBUTE_FILTER_BUTTON_SELECTOR = ".s-attribute-filter";

describe("Test AttributeFilterDropdownButton", () => {
    const renderComponent = (props = {}) => {
        const defaultProps: IAttributeFilterDropdownButtonProps = {
            title: "Product name",
            subtitle: "GoodData",
            isOpen: false,
            isLoaded: true,
            isLoading: false,
            isError: false,
        };
        const Wrapped = withIntl(AttributeFilterDropdownButton);
        return render(<Wrapped {...defaultProps} {...props} />);
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render the filter dropdown button at normal state", () => {
        renderComponent();

        expect(document.querySelector(".gd-message")).not.toBeInTheDocument();
    });

    it("should render the filter dropdown button when error state", () => {
        renderComponent({ isError: true });

        expect(document.querySelector(".gd-message")).toBeInTheDocument();
        expect(document.querySelector(".gd-icon-circle-cross")).toBeInTheDocument();
    });

    it("should render custom icon", () => {
        const customIcon = {
            icon: "icon",
            tooltip: "tooltip",
        };

        renderComponent({ customIcon });
        expect(mockFilterButtonCustomIcon).toHaveBeenCalledWith({ customIcon }, undefined);
    });

    it("should render the button as disabled", () => {
        const { container } = renderComponent({ disabled: true });
        expect(container.querySelector(ATTRIBUTE_FILTER_BUTTON_SELECTOR)).toHaveClass("disabled");
    });
});
