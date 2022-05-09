// (C) 2021 GoodData Corporation

type ButtonType = "apply" | "cancel";

export class DateFilter {
    open(): this {
        cy.get(".s-date-filter-button").click();
        return this;
    }

    selectAbsoluteForm(): this {
        this.getElement(".s-absolute-form").click();
        return this;
    }

    selectRelativeForm(): this {
        this.getElement(".s-relative-form").click();
        return this;
    }

    openAndSelectOption(options: string): this {
        this.open().getElement(options).click();
        return this;
    }

    openAndSelectRelativeForm(): this {
        return this.open().selectRelativeForm();
    }

    pressButton(type: ButtonType): this {
        cy.get(`.s-date-filter-${type}`).click();
        return this;
    }

    subtitleHasValue(value: string): Cypress.Chainable {
        return cy.get(".s-button-text").should("have.text", value);
    }

    private getDropdownElement(): Cypress.Chainable {
        return cy.get(".s-extended-date-filters-body");
    }

    private getElement(selector: string): Cypress.Chainable {
        return this.getDropdownElement().find(selector);
    }

    toggleTimeSwitcher(): void {
        cy.get(".time-switcher").click();
    }

    timeSwitcherHasValue(value: string): Cypress.Chainable {
        return cy.get(".time-switcher").should("have.text", value);
    }
}
