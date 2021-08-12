// (C) 2021 GoodData Corporation

import { getTestClassByTitle } from "./utils";

export class DateFilter {
    constructor(private name: string) {}

    getElement(): Cypress.Chainable {
        const testClass = getTestClassByTitle(this.name);
        return cy.get(testClass);
    }

    getSubtitleElement(): Cypress.Chainable {
        return cy.get(".s-button-text");
    }

    getDateFilterButtonElement(): Cypress.Chainable {
        return cy.get(".s-date-filter-button");
    }

    getThisMonthOptionElement(): Cypress.Chainable {
        return cy.get(".s-relative-preset-this-month");
    }

    getCancelButtonElement(): Cypress.Chainable {
        return cy.get(".s-date-filter-cancel");
    }

    getApplyButtonElement(): Cypress.Chainable {
        return cy.get(".s-date-filter-apply");
    }

    getAbsoluteFormOptionElement(): Cypress.Chainable {
        return cy.get(".s-absolute-form");
    }

    getRelativeFormElement(): Cypress.Chainable {
        return cy.get(".s-relative-form");
    }

    getDateFilterRangePickerFromElement(): Cypress.Chainable {
        return cy.get(".s-date-range-picker-from");
    }

    getDateFilterRangePickerToElement(): Cypress.Chainable {
        return cy.get(".s-date-range-picker-to");
    }

    getAbsoluteCalendarFrom(): Cypress.Chainable {
        return cy.get(".s-date-range-calendar-from");
    }

    getAbsoluteCalendarTo(): Cypress.Chainable {
        return cy.get(".s-date-range-calendar-to");
    }

    getFirstDayAfterThisMonthElement(): Cypress.Chainable {
        return cy.get(".DayPicker-Week:last-child .DayPicker-Day--outside").eq(4);
    }

    getMonthGranularityTabElement(): Cypress.Chainable {
        return cy.get(".s-granularity-month");
    }

    getRelativeFormFromElement(): Cypress.Chainable {
        return cy.get(".s-relative-range-picker-from");
    }

    getRelativeFormToElement(): Cypress.Chainable {
        return cy.get(".s-relative-range-picker-to");
    }

    getRelativeFormOptionElement(option: string): Cypress.Chainable {
        return cy.get(".s-relative-date-filter-option").contains(option);
    }
}
