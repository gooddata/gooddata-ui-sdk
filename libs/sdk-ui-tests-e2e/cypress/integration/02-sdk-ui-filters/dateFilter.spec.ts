// (C) 2021 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { DateFilter } from "../../tools/dateFilter";
import { clickOutside } from "../../tools/utils";

describe("DateFilter", () => {
    beforeEach(() => {
        Navigation.visit("dateFilter");
    });

    it("Filter should not be applied when we change filter and press cancel", () => {
        const dateFilter = new DateFilter("dateFilter");

        dateFilter.getSubtitleElement().should("have.text", "All time");
        dateFilter.getDateFilterButtonElement().click();
        dateFilter.getThisMonthOptionElement().click();
        dateFilter.getCancelButtonElement().click();
        dateFilter.getSubtitleElement().should("have.text", "All time");
    });

    it("Calendar appears when from field has focus", () => {
        const dateFilter = new DateFilter("dateFilter");

        dateFilter.getDateFilterButtonElement().click();

        dateFilter.getAbsoluteCalendarFrom().should("not.exist");
        dateFilter.getAbsoluteCalendarTo().should("not.exist");

        dateFilter.getAbsoluteFormOptionElement().click();
        dateFilter.getDateFilterRangePickerFromElement().click();

        dateFilter.getAbsoluteCalendarFrom().should("exist");
        dateFilter.getAbsoluteCalendarTo().should("not.exist");

        dateFilter.getDateFilterRangePickerToElement().click();

        dateFilter.getAbsoluteCalendarFrom().should("not.exist");
        dateFilter.getAbsoluteCalendarTo().should("exist");

        clickOutside();

        dateFilter.getAbsoluteCalendarFrom().should("not.exist");
        dateFilter.getAbsoluteCalendarTo().should("not.exist");
    });

    it("It is possible to pick day outside current month", () => {
        const dateFilter = new DateFilter("dateFilter");

        dateFilter.getDateFilterButtonElement().click();
        dateFilter.getAbsoluteFormOptionElement().click();
        dateFilter.getDateFilterRangePickerFromElement().find("input").clear().type("03/15/2019");
        dateFilter.getDateFilterRangePickerToElement().find("input").clear().type("03/15/2019");

        dateFilter.getDateFilterRangePickerToElement().click();
        dateFilter.getFirstDayAfterThisMonthElement().click();

        dateFilter.getApplyButtonElement().click();

        dateFilter.getSubtitleElement().should("have.text", "03/15/2019–04/05/2019");
    });

    it("Select menu item can be switched with arrow keys and enter", () => {
        const dateFilter = new DateFilter("dateFilter");

        dateFilter.getDateFilterButtonElement().click();
        dateFilter.getRelativeFormElement().click();

        dateFilter.getMonthGranularityTabElement().should("have.class", "is-active");

        dateFilter.getRelativeFormFromElement().click();
        dateFilter.getRelativeFormOptionElement("this month").should("have.class", "s-select-item-focused");

        dateFilter.getRelativeFormFromElement().type("{downarrow}");
        dateFilter.getRelativeFormOptionElement("next month").should("have.class", "s-select-item-focused");

        dateFilter.getRelativeFormFromElement().type("{uparrow}");
        dateFilter.getRelativeFormOptionElement("this month").should("have.class", "s-select-item-focused");

        dateFilter.getRelativeFormFromElement().type("{uparrow}");
        dateFilter.getRelativeFormOptionElement("last month").should("have.class", "s-select-item-focused");

        dateFilter.getRelativeFormFromElement().type("{enter}");
        dateFilter.getRelativeFormFromElement().find("input").should("have.value", "last month");
    });

    it("Select menu item can be selected with mouse", () => {
        const dateFilter = new DateFilter("dateFilter");

        dateFilter.getDateFilterButtonElement().click();
        dateFilter.getRelativeFormElement().click();

        dateFilter.getRelativeFormFromElement().click();

        dateFilter.getRelativeFormOptionElement("this month").click();
        dateFilter.getRelativeFormFromElement().find("input").should("have.value", "this month");
    });

    it("After selecting from range, to input gains focus", () => {
        const dateFilter = new DateFilter("dateFilter");

        dateFilter.getDateFilterButtonElement().click();
        dateFilter.getRelativeFormElement().click();

        dateFilter.getRelativeFormFromElement().click();

        dateFilter.getRelativeFormOptionElement("this month").click();
        dateFilter.getRelativeFormToElement().find("input").should("be.focused");
    });

    it("If invalid string is inputted, keep the previous option", () => {
        const dateFilter = new DateFilter("dateFilter");

        dateFilter.getDateFilterButtonElement().click();
        dateFilter.getRelativeFormElement().click();

        dateFilter.getRelativeFormFromElement().find("input").clearAndType("1");
        dateFilter.getRelativeFormFromElement().type("{enter}");

        dateFilter.getRelativeFormFromElement().find("input").should("have.value", "next month");

        dateFilter.getRelativeFormFromElement().find("input").clearAndType("xxx");

        // Cypress does not support tab key press at the moment. Need to blur out of the field by focusing another element.
        dateFilter.getRelativeFormToElement().findAndFocus("input");

        dateFilter.getRelativeFormFromElement().find("input").should("have.value", "next month");
    });
});
