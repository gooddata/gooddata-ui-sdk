// (C) 2021 GoodData Corporation

export class DateFilterAbsoluteForm {
    openFromRangePicker(): this {
        this.getElement(".s-date-range-picker-from").click();
        return this;
    }

    openToRangePicker(): this {
        this.getElement(".s-date-range-picker-to").click();
        return this;
    }

    typeIntoFromRangePickerInput(value: string): this {
        this.getElement(".s-date-range-picker-from")
            .find(".s-date-range-picker-input-field")
            .clear({ force: true })
            .type(value);
        return this;
    }

    typeIntoToRangePickerInput(value: string): this {
        this.getElement(".s-date-range-picker-to")
            .find(".s-date-range-picker-input-field")
            .clear({ force: true })
            .type(value);
        return this;
    }

    fromCalendarOpen(isOpen = true): this {
        this.getCalendarElement(".s-date-range-calendar-from").should(isOpen ? "exist" : "not.exist");
        return this;
    }

    toCalendarOpen(isOpen = true): this {
        this.getCalendarElement(".s-date-range-calendar-to").should(isOpen ? "exist" : "not.exist");
        return this;
    }

    selectDateInNextMonth(): this {
        cy.get(".rdp-row:last-child .rdp-day_outside").eq(4).click();
        return this;
    }

    /**
     * Chainable functions
     */
    private getElement(selector: string): Cypress.Chainable {
        return cy.get(".s-date-range-picker").find(selector);
    }

    private getCalendarElement(selector: string): Cypress.Chainable {
        return cy.get(selector);
    }
}
