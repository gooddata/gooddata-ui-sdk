// (C) 2019-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type DateFilterGranularity } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { type IRelativeDateFilterFormProps, RelativeDateFilterForm } from "../RelativeDateFilterForm.js";

const availableGranularities: DateFilterGranularity[] = [
    "GDC.time.date",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

const relativeFormOption: IRelativeDateFilterFormProps["selectedFilterOption"] = {
    type: "relativeForm",
    localIdentifier: "relativeForm",
    granularity: availableGranularities[0],
    name: "",
    visible: true,
};

const createForm = (props?: Partial<IRelativeDateFilterFormProps>) => {
    const defaultProps: IRelativeDateFilterFormProps = {
        availableGranularities,
        onSelectedFilterOptionChange: () => {},
        selectedFilterOption: relativeFormOption,
        isMobile: false,
    };
    return render(
        <IntlWrapper locale="en-US">
            <RelativeDateFilterForm {...defaultProps} {...props} />
        </IntlWrapper>,
    );
};

describe("RelativeDateFilterForm", () => {
    it("should render granularity tabs and relative range picker and pass them props", () => {
        // Asserted through the rendered output rather than through module mocks of the child
        // components, so that the test does not depend on the module registry state.
        const { container } = createForm({
            selectedFilterOption: { ...relativeFormOption, from: -3, to: 2 },
        });

        // availableGranularities and selectedGranularity reached the granularity tabs
        expect(container.querySelector(".s-relative-filter-form-granularity-tabs")).toBeInTheDocument();
        expect(Array.from(container.querySelectorAll('[role="tab"]')).map((tab) => tab.textContent)).toEqual([
            "Years",
            "Quarters",
            "Months",
            "Days",
        ]);
        expect(container.querySelector(".s-granularity-day")).toHaveAttribute("aria-selected", "true");

        // selectedFilterOption reached the relative range picker
        expect(container.querySelector(".s-relative-range-picker")).toBeInTheDocument();
        const [fromInput, toInput] = screen.getAllByPlaceholderText("Type or select");
        expect(fromInput).toHaveValue("3 days ago");
        expect(toInput).toHaveValue("2 days ahead");
    });

    it('should render "from" and "to" inputs', () => {
        createForm();
        expect(screen.getAllByPlaceholderText("Type or select").length).toBe(2);
    });

    it("should fire onSelectedFilterOptionChange when granularity or inputs change", () => {
        const onSelectedFilterOptionChange = vi.fn();
        createForm({ onSelectedFilterOptionChange });

        fireEvent.click(screen.getByText("Years"));
        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith({
            granularity: "GDC.time.year",
            localIdentifier: "relativeForm",
            type: "relativeForm",
            name: "",
            visible: true,
        });

        fireEvent.change(screen.getAllByPlaceholderText("Type or select")[1], { target: { value: "2" } });
        fireEvent.click(screen.getByText("2 days ahead"));

        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith({
            granularity: "GDC.time.date",
            localIdentifier: "relativeForm",
            type: "relativeForm",
            to: 2,
            name: "",
            visible: true,
        });

        fireEvent.change(screen.getAllByPlaceholderText("Type or select")[0], { target: { value: "-3" } });
        fireEvent.click(screen.getByText("3 days ago"));

        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith({
            granularity: "GDC.time.date",
            localIdentifier: "relativeForm",
            type: "relativeForm",
            from: -3,
            name: "",
            visible: true,
        });
    });

    it("should keep a selected offset of 1000 or more after blur", () => {
        const onSelectedFilterOptionChange = vi.fn();
        createForm({ onSelectedFilterOptionChange });

        const fromInput = screen.getAllByPlaceholderText("Type or select")[0];
        fireEvent.change(fromInput, { target: { value: "1440" } });
        fireEvent.click(screen.getByText("1,440 days ago"));

        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ from: -1440 }),
        );

        fireEvent.blur(fromInput);

        expect(screen.queryByText(/Invalid period start/)).not.toBeInTheDocument();
        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ from: -1440 }),
        );
    });
});
