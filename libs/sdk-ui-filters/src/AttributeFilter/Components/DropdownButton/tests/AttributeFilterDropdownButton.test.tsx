// (C) 2023-2025 GoodData Corporation
import { render } from "@testing-library/react";
import { WithIntlForTest } from "@gooddata/sdk-ui";
import { describe, it, expect, vi, afterEach } from "vitest";

import {
    AttributeFilterDropdownButton,
    IAttributeFilterDropdownButtonProps,
} from "../AttributeFilterDropdownButton.js";

/**
 * Mock FilterButtonCustomIcon to avoid test hangs after React 19 upgrade.
 *
 * The FilterButtonCustomIcon component uses BubbleHoverTrigger + Bubble components for tooltip functionality.
 * After React 19 upgrade, the complex DOM event handling and positioning logic in BubbleHoverTrigger
 * became incompatible with the JSDOM test environment, causing tests to hang during component initialization.
 *
 * React 19 changed component initialization and effect scheduling, making the async hover logic,
 * DOM positioning calculations, and event handling problematic in tests. This mock provides the same
 * DOM structure for testing without the complex interactions that cause hangs.
 */
vi.mock("../../../../shared/index.js", () => ({
    FilterButtonCustomIcon: ({ customIcon }: { customIcon?: any }) =>
        customIcon ? (
            <div className="gd-filter-button-custom-icon-wrapper s-gd-filter-button-custom-icon-wrapper">
                <i
                    className={`gd-filter-button-custom-icon s-gd-filter-button-custom-icon ${customIcon.icon}`}
                />
            </div>
        ) : null,
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
        return render(
            <WithIntlForTest>
                <AttributeFilterDropdownButton {...defaultProps} {...props} />
            </WithIntlForTest>,
        );
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
            icon: "gd-icon-custom",
            tooltip: "tooltip",
        };

        renderComponent({ customIcon });

        expect(document.querySelector(".gd-filter-button-custom-icon-wrapper")).toBeInTheDocument();
        expect(document.querySelector(".gd-icon-custom")).toBeInTheDocument();
    });

    it("should render the button as disabled", () => {
        const { container } = renderComponent({ disabled: true });
        expect(container.querySelector(ATTRIBUTE_FILTER_BUTTON_SELECTOR)).toHaveClass("disabled");
    });
});
