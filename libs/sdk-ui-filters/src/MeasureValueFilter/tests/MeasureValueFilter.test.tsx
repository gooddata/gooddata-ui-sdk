// (C) 2020-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { describe, expect, it, vi } from "vitest";

import { IMeasureValueFilter, localIdRef, newMeasureValueFilter } from "@gooddata/sdk-model";
import { withIntl } from "@gooddata/sdk-ui";

import { IMeasureValueFilterProps, MeasureValueFilter } from "../MeasureValueFilter.js";

// we cannot use factory here, it does not allow creating empty filters
const emptyFilter: IMeasureValueFilter = {
    measureValueFilter: {
        measure: localIdRef("myMeasure"),
    },
};

const renderComponent = (props?: Partial<IMeasureValueFilterProps>) => {
    const defaultProps: IMeasureValueFilterProps = {
        onApply: noop,
        onCancel: noop,
        filter: emptyFilter,
        measureIdentifier: "myMeasure",
        buttonTitle: "My measure",
    };
    const Wrapped = withIntl(MeasureValueFilter);
    return render(<Wrapped {...defaultProps} {...props} />);
};

const DROPDOWN_BODY = ".s-mvf-dropdown-body";

describe("Measure value filter", () => {
    it("should render a button with provided title", () => {
        renderComponent({ buttonTitle: "Test title" });

        expect(screen.getByText("Test title")).toBeInTheDocument();
    });

    it("should open and close the dropdown on button click", () => {
        renderComponent();
        const button = screen.getByText("My measure");
        expect(document.querySelector(DROPDOWN_BODY)).not.toBeInTheDocument();

        fireEvent.click(button);
        expect(document.querySelector(DROPDOWN_BODY)).toBeInTheDocument();

        fireEvent.click(button);
        expect(document.querySelector(DROPDOWN_BODY)).not.toBeInTheDocument();
    });

    it("should call onCancel when Cancel button clicked", () => {
        const onCancel = vi.fn();
        renderComponent({ onCancel });

        fireEvent.click(screen.getByText("My measure"));
        fireEvent.click(screen.getByText("Cancel"));

        expect(onCancel).toHaveBeenCalled();
    });

    it("should call onApply when Apply button clicked", () => {
        const onApply = vi.fn();
        const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 100);
        const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 123);

        renderComponent({ onApply, filter });

        fireEvent.click(screen.getByText("My measure"));
        fireEvent.change(screen.getByDisplayValue(100), {
            target: {
                value: 123,
            },
        });
        fireEvent.click(screen.getByText("Apply"));

        expect(onApply).toHaveBeenCalledWith(expectedFilter);
    });
});
