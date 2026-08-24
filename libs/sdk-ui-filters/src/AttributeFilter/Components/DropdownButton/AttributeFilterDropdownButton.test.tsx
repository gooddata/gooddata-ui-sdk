// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import {
    AttributeFilterDropdownButton,
    type IAttributeFilterDropdownButtonProps,
} from "./AttributeFilterDropdownButton.js";

const ATTRIBUTE_FILTER_BUTTON_SELECTOR = ".s-attribute-filter";
const CUSTOM_ICON_WRAPPER_SELECTOR = ".s-gd-filter-button-custom-icon-wrapper";
const CUSTOM_ICON_SELECTOR = ".s-gd-filter-button-custom-icon";

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
        const Wrapped = withIntlForTest(AttributeFilterDropdownButton);
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
            icon: "gd-icon-lock",
            tooltip: "tooltip",
        };

        const { container } = renderComponent({ customIcon });

        expect(container.querySelector(CUSTOM_ICON_WRAPPER_SELECTOR)).toBeInTheDocument();
        expect(container.querySelector(CUSTOM_ICON_SELECTOR)).toHaveClass(customIcon.icon);
    });

    it("should not render custom icon when it is not provided", () => {
        const { container } = renderComponent();

        expect(container.querySelector(CUSTOM_ICON_WRAPPER_SELECTOR)).toBeFalsy();
    });

    it("should render the button as disabled", () => {
        const { container } = renderComponent({ disabled: true });
        expect(container.querySelector(ATTRIBUTE_FILTER_BUTTON_SELECTOR)).toHaveClass("disabled");
    });

    it("should support callback button refs", () => {
        const buttonRef = vi.fn();
        const { container } = renderComponent({ buttonRef });

        expect(buttonRef).toHaveBeenLastCalledWith(container.querySelector(ATTRIBUTE_FILTER_BUTTON_SELECTOR));
    });

    it("forwards the row layout to the underlying control button", () => {
        const { container } = renderComponent({ layout: "row" });
        expect(container.querySelector(".gd-ui-kit-control-button--layout-row")).toBeInTheDocument();
    });

    it("forwards hideChevron to the underlying control button", () => {
        const { container } = renderComponent({ hideChevron: true });
        expect(container.querySelector(".gd-ui-kit-control-button--hideChevron")).toBeInTheDocument();
    });
});
