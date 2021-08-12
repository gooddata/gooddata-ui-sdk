// (C) 2021 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { DateFilter } from "../../tools/dateFilter";
import { clickOutside } from "../../tools/utils";

describe("DateFilter", () => {
    beforeEach(() => {
        Navigation.visit("dateFilter");
    });

    it("Filter should not be applied when we change filter and press cancel", () => {
        const dateFilter = new DateFilter();

        dateFilter.subtitleHasValue("All time");
        dateFilter.open();
        dateFilter.selectThisMonthOption();
        dateFilter.pressButton("cancel");
        dateFilter.subtitleHasValue("All time");
    });

    it("Calendar appears when from field has focus", () => {
        const dateFilter = new DateFilter();

        dateFilter.open();

        dateFilter.calendarShouldExist("from", false);
        dateFilter.calendarShouldExist("to", false);

        dateFilter.selectAbsoluteForm();
        dateFilter.openAbsoluteRangePicker("from");
        dateFilter.openAbsoluteRangePicker("from");

        dateFilter.calendarShouldExist("from", true);
        dateFilter.calendarShouldExist("to", false);

        dateFilter.openAbsoluteRangePicker("to");

        dateFilter.calendarShouldExist("from", false);
        dateFilter.calendarShouldExist("to", true);

        clickOutside();

        dateFilter.calendarShouldExist("from", false);
        dateFilter.calendarShouldExist("to", false);
    });

    it("It is possible to pick day outside current month", () => {
        const dateFilter = new DateFilter();

        dateFilter.openAndSelectAbsoluteForm();
        dateFilter.typeRangePickerValue("from", "03/15/2019");
        dateFilter.typeRangePickerValue("to", "03/15/2019");

        dateFilter.openAbsoluteRangePicker("to");
        dateFilter.selectDateInNextMonth();

        dateFilter.pressButton("apply");

        dateFilter.subtitleHasValue("03/15/2019–04/05/2019");
    });

    it("Select menu item can be switched with arrow keys and enter", () => {
        const dateFilter = new DateFilter();

        dateFilter.openAndSelectRelativeForm();

        dateFilter.shouldMonthGranularityBeSelected();

        dateFilter.openRelativeRangePicker("from");
        dateFilter.shouldRelativeFormHaveValueSelected("this month");

        dateFilter.pressKeyOnRelativeFormElement("downarrow");
        dateFilter.shouldRelativeFormHaveValueSelected("next month");

        dateFilter.pressKeyOnRelativeFormElement("uparrow");
        dateFilter.shouldRelativeFormHaveValueSelected("this month");

        dateFilter.pressKeyOnRelativeFormElement("uparrow");
        dateFilter.shouldRelativeFormHaveValueSelected("last month");

        dateFilter.pressKeyOnRelativeFormElement("enter");
        dateFilter.shouldRelativeFormHaveValue("last month");
    });

    it("Select menu item can be selected with mouse", () => {
        const dateFilter = new DateFilter();

        dateFilter.openAndSelectRelativeForm();

        dateFilter.openAndSelectRelativeRange("this month");
        dateFilter.shouldRelativeFormHaveValue("this month");
    });

    it("After selecting from range, to input gains focus", () => {
        const dateFilter = new DateFilter();

        dateFilter.openAndSelectRelativeForm();
        dateFilter.openAndSelectRelativeRange("this month");

        dateFilter.shouldRelativeFormRangeBeFocused("to");
    });

    it("If invalid string is inputted, keep the previous option", () => {
        const dateFilter = new DateFilter();

        dateFilter.openAndSelectRelativeForm();

        dateFilter.openRelativeFormRangeAndType("from", "1");
        dateFilter.pressKeyOnRelativeFormElement("enter");

        dateFilter.shouldRelativeFormHaveValue("next month");
        dateFilter.openRelativeFormRangeAndType("from", "xxx");

        // Cypress does not support tab key press at the moment. Need to blur out of the field by focusing another element.
        dateFilter.getRelativeFormToElement().find("input").focus();

        dateFilter.shouldRelativeFormHaveValue("next month");
    });
});
