// (C) 2021 GoodData Corporation

type CalendarType = "from" | "to";
type ButtonType = "apply" | "cancel";

export class DateFilter {
    constructor() {}

    open(): Cypress.Chainable {
        return cy.get(".s-date-filter-button").click();
    }

    selectAbsoluteForm(): Cypress.Chainable {
        return cy.get(".s-absolute-form").click();
    }

    selectRelativeForm(): Cypress.Chainable {
        return cy.get(".s-relative-form").click();
    }

    openAndSelectAbsoluteForm(): Cypress.Chainable {
        this.open();
        return this.selectAbsoluteForm();
    }

    openAndSelectRelativeForm(): Cypress.Chainable {
        this.open();
        return this.selectRelativeForm();
    }

    subtitleHasValue(value: string): Cypress.Chainable {
        return cy.get(".s-button-text").should("have.text", value);
    }

    calendarShouldExist(type: CalendarType, shouldExist: boolean): Cypress.Chainable {
        const elementClass = `.s-date-range-calendar-${type}`;
        const chainer = shouldExist ? "exist" : "not.exist";

        return cy.get(elementClass).should(chainer);
    }

    openAbsoluteRangePicker(type: CalendarType): Cypress.Chainable {
        return cy.get(`.s-date-range-picker-${type}`).click();
    }

    openRelativeRangePicker(type: CalendarType): Cypress.Chainable {
        return cy.get(`.s-relative-range-picker-${type}`).click();
    }

    typeRangePickerValue(type: CalendarType, value: string) {
        cy.get(`.s-date-range-picker-${type}`).find("input").clear().type(value);
    }

    selectDateInNextMonth(): Cypress.Chainable {
        return cy.get(".DayPicker-Week:last-child .DayPicker-Day--outside").eq(4).click();
    }

    shouldMonthGranularityBeSelected(): Cypress.Chainable {
        return cy.get(".s-granularity-month").should("have.class", "is-active");
    }

    shouldRelativeFormHaveValueSelected(option: string): Cypress.Chainable {
        return cy
            .get(".s-relative-date-filter-option")
            .contains(option)
            .should("have.class", "s-select-item-focused");
    }

    pressKeyOnRelativeFormElement(key: string): Cypress.Chainable {
        return cy.get(".s-relative-range-picker-from").type(`{${key}}`);
    }

    shouldRelativeFormHaveValue(value: string): Cypress.Chainable {
        return cy.get(".s-relative-range-picker-from").find("input").should("have.value", value);
    }

    openAndSelectRelativeRange(selection: string): Cypress.Chainable {
        this.openRelativeRangePicker("from");
        return cy.get(".s-relative-date-filter-option").contains(selection).click();
    }

    shouldRelativeFormRangeBeFocused(type: CalendarType): Cypress.Chainable {
        return cy.get(`.s-relative-range-picker-${type}`).find("input").should("be.focused");
    }

    pressButton(type: ButtonType): Cypress.Chainable {
        return cy.get(`.s-date-filter-${type}`).click();
    }

    openRelativeFormRangeAndType(type: CalendarType, value: string): Cypress.Chainable {
        return cy.get(`.s-relative-range-picker-${type}`).find("input").type(value);
    }

    selectThisMonthOption(): Cypress.Chainable {
        return cy.get(".s-relative-preset-this-month").click();
    }

    getRelativeFormToElement(): Cypress.Chainable {
        return cy.get(".s-relative-range-picker-to");
    }
}
