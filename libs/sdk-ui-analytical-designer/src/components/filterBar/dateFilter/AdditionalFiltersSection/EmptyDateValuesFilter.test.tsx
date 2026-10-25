// (C) 2025-2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type EmptyDateValuesFilterMode } from "../../../../store/filter_bar/filter_bar_types.js";
import { withIntl } from "../../../../utils/with_intl.js";

import { EmptyDateValuesFilter } from "./EmptyDateValuesFilter.js";

interface IRenderComponentProps {
    mode?: EmptyDateValuesFilterMode;
    onModeChange?: (mode: EmptyDateValuesFilterMode) => void;
    onRemove?: () => void;
    openOnInit?: boolean;
}

const renderComponent = (props: IRenderComponentProps = {}) => {
    const defaultProps = {
        mode: "include" as EmptyDateValuesFilterMode,
        onModeChange: vi.fn(),
        onRemove: vi.fn(),
        openOnInit: false,
    };

    const Wrapped = withIntl(EmptyDateValuesFilter);
    return render(<Wrapped {...defaultProps} {...props} />);
};

const getDropdownButton = () => document.querySelector(".s-adi-empty-values-filter-button");
const getDropdown = () => document.querySelector(".adi-empty-values-filter-dropdown");
const getRemoveButton = () => document.querySelector(".s-remove-empty-values-filter");
const getListboxOption = (optionId: string) =>
    document.querySelector(`.adi-empty-values-filter-dropdown [id$="-${optionId}"]`);

describe("EmptyDateValuesFilter", () => {
    describe("rendering", () => {
        it("should render the filter with Include mode label", () => {
            renderComponent({ mode: "include" });

            expect(screen.getByText("Include")).toBeInTheDocument();
        });

        it("should render the filter with Exclude mode label", () => {
            renderComponent({ mode: "exclude" });

            expect(screen.getByText("Exclude")).toBeInTheDocument();
        });

        it("should render the filter with Only mode label", () => {
            renderComponent({ mode: "only" });

            expect(screen.getByText("Only")).toBeInTheDocument();
        });

        it("should render the remove button", () => {
            renderComponent();

            expect(getRemoveButton()).toBeInTheDocument();
        });

        it("should render the dropdown button", () => {
            renderComponent();

            expect(getDropdownButton()).toBeInTheDocument();
        });
    });

    describe("dropdown interaction", () => {
        it("should open dropdown on button click", async () => {
            renderComponent();

            expect(getDropdown()).not.toBeInTheDocument();

            fireEvent.click(getDropdownButton());

            await waitFor(() => {
                expect(getDropdown()).toBeInTheDocument();
            });
        });

        it("should show all three mode options in dropdown", async () => {
            renderComponent();

            fireEvent.click(getDropdownButton());

            await waitFor(() => {
                expect(getListboxOption("include")).toBeInTheDocument();
                expect(getListboxOption("exclude")).toBeInTheDocument();
                expect(getListboxOption("only")).toBeInTheDocument();
            });
        });

        it("should call onModeChange when selecting a different mode", async () => {
            const onModeChange = vi.fn();
            renderComponent({ mode: "include", onModeChange });

            fireEvent.click(getDropdownButton());

            await waitFor(() => {
                expect(getDropdown()).toBeInTheDocument();
            });

            const excludeOption = getListboxOption("exclude");
            expect(excludeOption).toBeInTheDocument();

            // UiListbox items require clicking on the inner div, not the li element
            const innerElement = excludeOption?.querySelector(".gd-ui-kit-listbox__item");
            fireEvent.click(innerElement);

            expect(onModeChange).toHaveBeenCalledWith("exclude");
        });

        it("should call onModeChange when selecting 'only' mode", async () => {
            const onModeChange = vi.fn();
            renderComponent({ mode: "include", onModeChange });

            fireEvent.click(getDropdownButton());

            await waitFor(() => {
                expect(getDropdown()).toBeInTheDocument();
            });

            const onlyOption = getListboxOption("only");
            expect(onlyOption).toBeInTheDocument();

            const innerElement = onlyOption?.querySelector(".gd-ui-kit-listbox__item");
            fireEvent.click(innerElement);

            expect(onModeChange).toHaveBeenCalledWith("only");
        });

        it("should render tooltip icon for 'only' option", async () => {
            renderComponent();

            fireEvent.click(getDropdownButton());

            await waitFor(() => {
                expect(getDropdown()).toBeInTheDocument();
            });

            const onlyOption = getListboxOption("only");
            // "only" option has a tooltip explanation icon
            const tooltipIcon = onlyOption?.querySelector(".gd-ui-kit-listbox__item-explanation");
            expect(tooltipIcon).toBeInTheDocument();
        });
    });

    describe("remove action", () => {
        it("should call onRemove when clicking the remove button", () => {
            const onRemove = vi.fn();
            renderComponent({ onRemove });

            fireEvent.click(getRemoveButton());

            expect(onRemove).toHaveBeenCalled();
        });
    });
});
