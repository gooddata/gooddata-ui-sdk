// (C) 2021 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { DateFilter } from "../../tools/dateFilter";
import { clickOutside } from "../../tools/utils";
import { DateFilterAbsoluteForm } from "../../tools/dateFilterAbsoluteForm";
import { DateFilterRelativeForm } from "../../tools/dateFilterRelativeForm";

describe("DateFilter", () => {
    beforeEach(() => {
        Navigation.visit("dateFilter");
    });

    it("Filter should not be applied when we change filter and press cancel", () => {
        const dateFilter = new DateFilter();

        dateFilter.subtitleHasValue("All time");
        dateFilter.openAndSelectOption(".s-relative-preset-this-month");
        dateFilter.pressButton("cancel");
        dateFilter.subtitleHasValue("All time");
    });

    it("Calendar appears when from field has focus", () => {
        const dateFilter = new DateFilter();
        const dateFilterAbsoluteForm = new DateFilterAbsoluteForm();

        dateFilter.openAndSelectOption(".s-absolute-form");

        dateFilterAbsoluteForm.fromCalendarOpen(false);
        dateFilterAbsoluteForm.toCalendarOpen(false);

        dateFilterAbsoluteForm.openFromRangePicker();
        dateFilterAbsoluteForm.fromCalendarOpen();
        dateFilterAbsoluteForm.toCalendarOpen(false);

        dateFilterAbsoluteForm.openToRangePicker();
        dateFilterAbsoluteForm.fromCalendarOpen(false);
        dateFilterAbsoluteForm.toCalendarOpen(true);

        clickOutside();

        dateFilterAbsoluteForm.fromCalendarOpen(false);
        dateFilterAbsoluteForm.toCalendarOpen(false);
    });

    it("It is possible to pick day outside current month", () => {
        const dateFilter = new DateFilter();
        const dateFilterAbsoluteForm = new DateFilterAbsoluteForm();

        dateFilter.openAndSelectOption(".s-absolute-form");
        dateFilterAbsoluteForm.typeIntoFromRangePickerInput("03/15/2019");
        dateFilterAbsoluteForm.typeIntoToRangePickerInput("03/15/2019");

        dateFilterAbsoluteForm.openToRangePicker();
        dateFilterAbsoluteForm.selectDateInNextMonth();

        dateFilter.pressButton("apply");

        dateFilter.subtitleHasValue("03/15/2019–04/05/2019");
    });

    it("Select menu item can be switched with arrow keys and enter", () => {
        const dateFilter = new DateFilter();
        const dateFilterRelativeForm = new DateFilterRelativeForm();

        dateFilter.openAndSelectRelativeForm();

        dateFilterRelativeForm.granularitySelected("month");

        dateFilterRelativeForm.openFromRangePicker();
        dateFilterRelativeForm.rangePickerFromHasValueSelected("this month");

        dateFilterRelativeForm.pressKey("downarrow");
        dateFilterRelativeForm.rangePickerFromHasValueSelected("next month");

        dateFilterRelativeForm.pressKey("uparrow");
        dateFilterRelativeForm.rangePickerFromHasValueSelected("this month");

        dateFilterRelativeForm.pressKey("uparrow");
        dateFilterRelativeForm.rangePickerFromHasValueSelected("last month");

        dateFilterRelativeForm.pressKey("enter");
        dateFilterRelativeForm.rangePickerFromHasValue("last month");
    });

    it("Select menu item can be selected with mouse", () => {
        const dateFilter = new DateFilter();
        const dateFilterRelativeForm = new DateFilterRelativeForm();

        dateFilter.openAndSelectRelativeForm();

        dateFilterRelativeForm.openFromRangePicker();
        dateFilterRelativeForm.rangePickerSelectOption("this month");
        dateFilterRelativeForm.rangePickerFromHasValue("this month");
    });

    it("After selecting from range, to input gains focus", () => {
        const dateFilter = new DateFilter();
        const dateFilterRelativeForm = new DateFilterRelativeForm();

        dateFilter.openAndSelectRelativeForm();
        dateFilterRelativeForm.openFromRangePicker();
        dateFilterRelativeForm.rangePickerSelectOption("this month");

        dateFilterRelativeForm.rangePickerToFocused();
    });

    it("If invalid string is inputted, keep the previous option", () => {
        const dateFilter = new DateFilter();
        const dateFilterRelativeForm = new DateFilterRelativeForm();

        dateFilter.openAndSelectRelativeForm();

        dateFilterRelativeForm.typeIntoFromInput("1");
        dateFilterRelativeForm.pressKey("enter");

        dateFilterRelativeForm.rangePickerFromHasValue("next month");
        dateFilterRelativeForm.typeIntoFromInput("xxx");

        dateFilterRelativeForm.focusToRangePicker();
        dateFilterRelativeForm.rangePickerFromHasValue("next month");
    });
});
