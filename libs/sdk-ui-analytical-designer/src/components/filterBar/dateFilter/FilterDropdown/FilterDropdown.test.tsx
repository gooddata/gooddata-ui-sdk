// (C) 2019-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../../utils/with_intl.js";
import { ALL_TIME_FILTER_OPTION } from "../defaultFilterOptions.js";

import { FilterDropdown, type IFilterDropdownProps } from "./FilterDropdown.js";

describe("FilterDropdown", () => {
    function createDefaultProps(): IFilterDropdownProps {
        return {
            filter: {
                filterOption: ALL_TIME_FILTER_OPTION,
                excludeCurrentPeriod: false,
            },
            datasetTitle: "activity",
            isUsedByInsight: true,
            overTimeComparisonSummary: null,
            additionalDateFilterLabels: [],
            migratedAdditionalFilters: [],
            className: "custom-class-name",
            isOpen: true,
            dateFormat: "MM/dd/yyyy",
            onOpen: vi.fn(),
            onClose: vi.fn(),
            isTimeForAbsoluteRangeEnabled: false,
        };
    }

    function renderComponent(props: IFilterDropdownProps) {
        const Wrapped = withIntl(FilterDropdown);
        return render(
            <Wrapped {...props}>
                <div className="orig_child" />
            </Wrapped>,
        );
    }

    it("renders the root div with classes", () => {
        const { container } = renderComponent(createDefaultProps());

        const root = container.querySelectorAll(".s-attr-filter");
        expect(root.length).toBe(1);
    });

    it("renders button with all the classes", () => {
        const { container } = renderComponent(createDefaultProps());

        const button = container.querySelector(".gd-button");
        expect(button).toHaveClass(
            "dropdown-button toggle-menu adi-filter-button s-filter-button s-date-filter-button adi-date-filter-button",
        );
        expect(button).toHaveClass("button-dropdown gd-icon-right is-active");
    });

    it("renders button as inactive when not open", () => {
        const props: IFilterDropdownProps = { ...createDefaultProps(), isOpen: false };
        const { container } = renderComponent(props);

        const button = container.querySelector(".gd-button");
        expect(button).not.toHaveClass("is-active");
    });

    it("calls onClose when clicked open dropdown button", () => {
        const props: IFilterDropdownProps = { ...createDefaultProps(), isOpen: true };

        const { container } = renderComponent(props);
        const button = container.querySelector(".gd-button");
        fireEvent.click(button);

        expect(props.onClose).toHaveBeenCalled();
    });

    it("calls onOpen when clicked closed dropdown button", () => {
        const props: IFilterDropdownProps = { ...createDefaultProps(), isOpen: false };

        const { container } = renderComponent(props);
        const button = container.querySelector(".gd-button");
        fireEvent.click(button);

        expect(props.onOpen).toHaveBeenCalled();
    });

    it("renders GlobalDateFilterLabel", () => {
        const { container } = renderComponent(createDefaultProps());

        const globalFilterLabel = container.querySelectorAll(".s-global-filter-label-bottom");
        expect(globalFilterLabel.length).toBe(1);
    });

    it("renders the Overlay when isOpen is true", () => {
        const props: IFilterDropdownProps = { ...createDefaultProps(), isOpen: true };

        renderComponent(props);

        const overlay = document.querySelectorAll(".gd-overlay-content");
        expect(overlay.length).toBe(1);
    });

    it("does not render the Overlay when isOpen is false", () => {
        const props: IFilterDropdownProps = { ...createDefaultProps(), isOpen: false };

        renderComponent(props);

        const overlay = document.querySelectorAll(".gd-overlay-content");
        expect(overlay.length).toBe(0);
    });

    it("renders original children wrapped in overlay and an extra div", () => {
        const props: IFilterDropdownProps = { ...createDefaultProps(), isOpen: true };

        renderComponent(props);

        const overlay = document.querySelector(".gd-overlay-content");
        const overlayChildrenWrapper = overlay.querySelector(".adi-filter-picker");
        const originalChildren = overlayChildrenWrapper.querySelectorAll(".orig_child");
        expect(originalChildren.length).toBe(1);
    });

    it("wraps the original children i div with classes", () => {
        const props: IFilterDropdownProps = { ...createDefaultProps(), isOpen: true };

        renderComponent(props);

        const overlay = document.querySelector(".gd-overlay-content");
        const overlayChildrenWrapper = overlay.querySelector(".adi-filter-picker");
        expect(overlayChildrenWrapper).toBeInTheDocument();
        expect(overlayChildrenWrapper).toHaveClass(
            "overlay gd-dialog gd-dropdown adi-filter-picker s-filter-picker adi-date-filter-picker adi-date-filter-picker-wide",
        );
    });

    describe("warningMessage prop", () => {
        it("should display warning message when warningMessage prop is provided", () => {
            const props: IFilterDropdownProps = {
                ...createDefaultProps(),
                migratedAdditionalFilters: ["m1"],
                isOpen: false,
            };
            const { container } = renderComponent(props);
            expect(container.querySelector(".s-filter-warning")).toBeInTheDocument();
        });

        it("should not display warning message when warningMessage prop is not provided", () => {
            const props: IFilterDropdownProps = { ...createDefaultProps() };
            const { container } = renderComponent(props);

            fireEvent.mouseEnter(container.querySelector(".s-filter-button"));
            expect(container.querySelector(".s-filter-warning")).not.toBeInTheDocument();
        });
    });
});
