// (C) 2021 GoodData Corporation

type ButtonType = "apply" | "cancel";

type RelativePreset =
    | "relative-last-month"
    | "relative-this-year"
    | "relative-last-7-days"
    | "relative-last-6-days"
    | "relative-last-5-days"
    | "hidden-relative-preset"
    | "hidden-relative-preset-2"
    | "relative-this-week";

type AbsolutePreset =
    | "christmas-2011"
    | "christmas-2012"
    | "hidden-absolute-preset"
    | "hidden-absolute-preset-2";

export class DateFilter {
    open(): this {
        cy.get(".s-date-filter-button").click();
        return this;
    }

    selectAbsoluteForm(): this {
        this.getElement(".s-absolute-form").click();
        return this;
    }

    selectAbsolutePreset(preset: AbsolutePreset) {
        this.getOption(`.s-absolute-preset-${preset}`).click({ scrollBehavior: false });
        return this;
    }

    selectRelativePreset(preset: RelativePreset) {
        this.getOption(`.s-relative-preset-${preset}`).click({ scrollBehavior: false });
        return this;
    }

    selectRelativeForm(): this {
        this.getElement(".s-relative-form").click();
        return this;
    }

    selectFloatingRange() {
        this.getOption(".s-relative-form").click({ scrollBehavior: false });
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

    hasRelativePreset(preset: RelativePreset, expect = true) {
        this.getOption(`.s-relative-preset-${preset}`).should(expect ? "exist" : "not.exist");
        return this;
    }

    hasAbsolutePreset(preset: AbsolutePreset, expect = true) {
        this.getOption(`.s-absolute-preset-${preset}`).should(expect ? "exist" : "not.exist");
        return this;
    }

    apply() {
        this.getDropdownElement().find(".s-date-filter-apply").click({ scrollBehavior: false });
        return this;
    }

    applyEnabled(expect = true) {
        this.getDropdownElement()
            .find(".s-date-filter-apply")
            .should(expect ? "not.have.class" : "have.class", "disabled");
        return this;
    }

    cancel() {
        this.getDropdownElement().find(".s-date-filter-cancel").click({ scrollBehavior: false });
        return this;
    }

    private getOption(selector: string) {
        return this.getDropdownElement().find(selector);
    }
}
