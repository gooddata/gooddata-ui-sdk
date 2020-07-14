// (C) 2020 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import noop = require("lodash/noop");
import { withIntl } from "@gooddata/sdk-ui";
import { IMeasureValueFilter, newMeasureValueFilter, localIdRef } from "@gooddata/sdk-model";

import { MeasureValueFilter, IMeasureValueFilterProps } from "../MeasureValueFilter";
import { MeasureValueFilterDropdown } from "../MeasureValueFilterDropdown";
import MVFDropdownFragment from "./fragments/MeasureValueFilterDropdown";

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
    return mount(<Wrapped {...defaultProps} {...props} />);
};

describe("Measure value filter", () => {
    it("should render a button with provided title", () => {
        const component = renderComponent({ buttonTitle: "Test title" });

        expect(component.find(".s-mvf-dropdown-button").text()).toEqual("Test title");
    });

    it("should open and close the dropdown on button click", () => {
        const component = renderComponent();

        expect(component.find(MeasureValueFilterDropdown).exists()).toEqual(false);

        component.find(".s-mvf-dropdown-button").simulate("click");
        expect(component.find(MeasureValueFilterDropdown).exists()).toEqual(true);

        component.find(".s-mvf-dropdown-button").simulate("click");
        expect(component.find(MeasureValueFilterDropdown).exists()).toEqual(false);
    });

    it("should call onCancel when Cancel button clicked", () => {
        const onCancel = jest.fn();
        const component = renderComponent({ onCancel });

        component.find(".s-mvf-dropdown-button").simulate("click");

        const dropdown = component.find(MeasureValueFilterDropdown);
        const dropdownFragment = new MVFDropdownFragment(dropdown);
        dropdownFragment.clickCancel();

        expect(onCancel).toHaveBeenCalled();
    });

    it("should call onApply when Apply button clicked", () => {
        const onApply = jest.fn();
        const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 100);
        const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 123);

        const component = renderComponent({ onApply, filter });

        component.find(".s-mvf-dropdown-button").simulate("click");

        const dropdown = component.find(MeasureValueFilterDropdown);
        const dropdownFragment = new MVFDropdownFragment(dropdown);
        dropdownFragment.setComparisonValue("123");
        dropdownFragment.clickApply();

        expect(onApply).toHaveBeenCalledWith(expectedFilter);
    });
});
