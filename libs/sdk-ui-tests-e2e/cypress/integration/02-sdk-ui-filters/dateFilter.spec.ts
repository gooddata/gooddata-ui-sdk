// (C) 2021 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { DateFilter } from "../../tools/dateFilter";
import { clickOutside } from "../../tools/utils";
import { DateFilterAbsoluteForm } from "../../tools/dateFilterAbsoluteForm";
import { DateFilterRelativeForm } from "../../tools/dateFilterRelativeForm";

describe("DateFilter", () => {
    beforeEach(() => {
        Navigation.visit("filters/dateFilter");
    });

    it("Filter should not be applied when we change filter and press cancel", () => {
        const dateFilter = new DateFilter();

        dateFilter.subtitleHasValue("All time");

        dateFilter
            .openAndSelectOption(".s-relative-preset-this-month")
            .pressButton("cancel")
            .subtitleHasValue("All time");
    });

    it("Calendar appears when from field has focus", () => {
        const dateFilter = new DateFilter();
        const dateFilterAbsoluteForm = new DateFilterAbsoluteForm();

        dateFilter.openAndSelectOption(".s-absolute-form");

        dateFilterAbsoluteForm
            .fromCalendarOpen(false)
            .toCalendarOpen(false)
            .openFromRangePicker()
            .fromCalendarOpen()
            .toCalendarOpen(false)
            .openToRangePicker()
            .fromCalendarOpen(false)
            .toCalendarOpen(true);

        clickOutside();

        dateFilterAbsoluteForm.fromCalendarOpen(false).toCalendarOpen(false);
    });

    it("It is possible to pick day outside current month", () => {
        const dateFilter = new DateFilter();
        const dateFilterAbsoluteForm = new DateFilterAbsoluteForm();

        dateFilter.openAndSelectOption(".s-absolute-form");

        dateFilterAbsoluteForm
            .typeIntoFromRangePickerInput("03/15/2019")
            .typeIntoToRangePickerInput("03/15/2019")
            .openToRangePicker()
            .selectDateInNextMonth();

        dateFilter.pressButton("apply").subtitleHasValue("03/15/2019–04/05/2019");
    });

    it("Select menu item can be switched with arrow keys and enter", () => {
        const dateFilter = new DateFilter();
        const dateFilterRelativeForm = new DateFilterRelativeForm();

        dateFilter.openAndSelectRelativeForm();

        dateFilterRelativeForm
            .granularitySelected("month")
            .openFromRangePicker()
            .rangePickerFromHasValueSelected("this month")
            .pressKey("downarrow")
            .rangePickerFromHasValueSelected("next month")
            .pressKey("uparrow")
            .rangePickerFromHasValueSelected("this month")
            .pressKey("uparrow")
            .rangePickerFromHasValueSelected("last month")
            .pressKey("enter")
            .rangePickerFromHasValue("last month");
    });

    it("Select menu item can be selected with mouse", () => {
        const dateFilter = new DateFilter();
        const dateFilterRelativeForm = new DateFilterRelativeForm();

        dateFilter.openAndSelectRelativeForm();

        dateFilterRelativeForm.openFromRangePicker().rangePickerSelectOption("this month");

        dateFilterRelativeForm.rangePickerFromHasValue("this month");
    });

    it("After selecting from range, to input gains focus", () => {
        const dateFilter = new DateFilter();
        const dateFilterRelativeForm = new DateFilterRelativeForm();

        dateFilter.openAndSelectRelativeForm();
        dateFilterRelativeForm
            .openFromRangePicker()
            .rangePickerSelectOption("this month")
            .rangePickerToFocused();
    });

    it("If invalid string is inputted, keep the previous option", () => {
        const dateFilter = new DateFilter();
        const dateFilterRelativeForm = new DateFilterRelativeForm();

        dateFilter.openAndSelectRelativeForm();

        dateFilterRelativeForm
            .typeIntoFromInput("1")
            .pressKey("enter")
            .rangePickerFromHasValue("next month")
            .typeIntoFromInput("xxx")
            .focusToRangePicker()
            .rangePickerFromHasValue("next month");
    });
});
