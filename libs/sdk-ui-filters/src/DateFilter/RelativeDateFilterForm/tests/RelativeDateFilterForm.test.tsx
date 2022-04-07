// (C) 2019-2022 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { DateFilterGranularity } from "@gooddata/sdk-model";
import { RelativeDateFilterForm, IRelativeDateFilterFormProps } from "../RelativeDateFilterForm";
import { clickOn } from "../../tests/utils";
import { GranularityTabs } from "../GranularityTabs";
import { RelativeRangePicker } from "../../RelativeRangePicker/RelativeRangePicker";

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
        onSelectedFilterOptionChange: noop,
        selectedFilterOption: relativeFormOption,
        isMobile: false,
    };
    return mount(
        <IntlWrapper locale="en-US">
            <RelativeDateFilterForm {...defaultProps} {...props} />
        </IntlWrapper>,
    );
};

describe("RelativeDateFilterForm", () => {
    it("should render granularity tabs and relative range picker and pass them props", () => {
        const rendered = createForm();
        const tabs = rendered.find(GranularityTabs);
        expect(tabs).toExist();
        expect(tabs).toHaveProp("availableGranularities", availableGranularities);
        expect(tabs).toHaveProp("selectedGranularity", relativeFormOption.granularity);
        const rangePicker = rendered.find(RelativeRangePicker);
        expect(rangePicker).toExist();
        expect(rangePicker).toHaveProp("selectedFilterOption", relativeFormOption);
    });

    it('should render "from" and "to" inputs', () => {
        const rendered = createForm();
        const fromInput = rendered.find(".s-relative-range-picker-from input");
        expect(fromInput).toExist();
        const toInput = rendered.find(".s-relative-range-picker-to input");
        expect(toInput).toExist();
    });

    it("should fire onSelectedFilterOptionChange when granularity or inputs change", () => {
        const onSelectedFilterOptionChange = jest.fn();
        const rendered = createForm({ onSelectedFilterOptionChange });

        const lastTab = rendered.find("div.s-granularity-year");
        clickOn(lastTab);
        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith({
            granularity: "GDC.time.year",
            localIdentifier: "relativeForm",
            type: "relativeForm",
            name: "",
            visible: true,
        });

        const fromInput = rendered.find(".s-relative-range-picker-from input");
        fromInput.simulate("change", { target: { value: "-3" } });
        const fromFirstOption = rendered.find(".gd-select-option").first();
        fromFirstOption.simulate("click");

        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith({
            granularity: "GDC.time.date",
            localIdentifier: "relativeForm",
            type: "relativeForm",
            from: -3,
            name: "",
            visible: true,
        });

        const toInput = rendered.find(".s-relative-range-picker-to input");
        toInput.simulate("change", { target: { value: "2" } });
        const toFirstOption = rendered.find(".gd-select-option").first();
        toFirstOption.simulate("click");

        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith({
            granularity: "GDC.time.date",
            localIdentifier: "relativeForm",
            type: "relativeForm",
            to: 2,
            name: "",
            visible: true,
        });
    });
});
