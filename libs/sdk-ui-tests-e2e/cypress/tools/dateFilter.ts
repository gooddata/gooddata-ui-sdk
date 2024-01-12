// (C) 2021-2024 GoodData Corporation

import { DashboardDateFilterConfigMode } from "@gooddata/sdk-model";

const DATE_MESSAGE_SELECTOR = ".gd-extended-date-filter-edit-mode-message-text";

type ButtonType = "apply" | "cancel";

export type RelativePreset =
    | "relative-last-month"
    | "relative-this-month"
    | "relative-last-12-months"
    | "relative-last-year"
    | "relative-this-year"
    | "relative-this-quarter"
    | "relative-last-quarter"
    | "relative-last-4-quarters"
    | "relative-last-7-days"
    | "relative-last-6-days"
    | "relative-last-5-days"
    | "relative-last-30-days"
    | "relative-last-90-days"
    | "hidden-relative-preset"
    | "hidden-relative-preset-2"
    | "relative-this-week"
    | "relative-last-week"
    | "relative-this-2-weeks"
    | "this-week";

export type AbsolutePreset =
    | "christmas-2011"
    | "christmas-2012"
    | "hidden-absolute-preset"
    | "hidden-absolute-preset-2";

export class DateFilter {
    getDateFilterElement() {
        return cy.get(".s-date-filter-button");
    }

    open(): this {
        cy.get(".s-date-filter-button").click();
        return this;
    }

    selectAbsoluteForm(): this {
        this.getElement(".s-absolute-form").click();
        return this;
    }

    selectAbsolutePreset(preset: AbsolutePreset) {
        this.getOption(`.s-absolute-preset-${preset}`).click();
        return this;
    }

    selectRelativePreset(preset: RelativePreset) {
        this.getOption(`.s-relative-preset-${preset}`).click();
        return this;
    }

    selectRelativeForm(): this {
        this.getElement(".s-relative-form").click();
        return this;
    }

    selectFloatingRange() {
        this.getOption(".s-relative-form").click();
        return this;
    }

    openAndSelectOption(options: string): this {
        this.open().getElement(options).click();
        return this;
    }

    openAndSelectDateFilterByName(dateFilterName: string): this {
        this.open().getElement(".gd-filter-list-item").contains(dateFilterName).scrollIntoView().click();
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

    private getOption(selector: string) {
        return this.getDropdownElement().find(selector);
    }

    apply() {
        this.getDropdownElement().find(".s-date-filter-apply").click();
        return this;
    }

    applyEnabled(expect = true) {
        this.getDropdownElement()
            .find(".s-date-filter-apply")
            .should(expect ? "not.have.class" : "have.class", "disabled");
        return this;
    }

    cancel() {
        this.getDropdownElement().find(".s-date-filter-cancel").click();
        return this;
    }

    isDateFilterMessageVisibled(expect: boolean) {
        this.getElement(DATE_MESSAGE_SELECTOR).should(expect ? "be.visible" : "not.exist");
        return this;
    }

    hasSelectedDateFilterValue(dateValue: string) {
        cy.get(".gd-list-item.is-selected").should("have.text", dateValue);
        return this;
    }

    waitDateFilterButtonVisible() {
        cy.get(".s-date-filter-button", { timeout: 60000 }).should("be.visible");
        return this;
    }

    isVisible(expected = true) {
        cy.get(".s-date-filter-button").should(expected ? "be.visible" : "not.exist");
        return this;
    }

    openConfiguration() {
        cy.get(".s-gd-date-filter-configuration-button").click();
        return this;
    }

    getConfigurationMode(mode: DashboardDateFilterConfigMode) {
        return cy.get(".s-configuration-item-mode").find(`.s-config-state-${mode}`);
    }

    selectConfigurationMode(mode: DashboardDateFilterConfigMode) {
        const click = ($el: any) => $el.click();

        this.getConfigurationMode(mode)
            .pipe(click)
            .should(($el) => {
                expect($el.parent(".gd-extended-date-filter-container").find(".s-apply.s-save.disabled")).not
                    .to.be.exist; // eslint-disable-line jest/valid-expect
            });
        return this;
    }

    hoverOnConfigurationMode(mode: DashboardDateFilterConfigMode) {
        this.getConfigurationMode(mode).scrollIntoView().realHover();
    }

    saveConfiguration() {
        cy.get(".s-gd-extended-date-filter-actions-right-content .s-date-filter-apply")
            .should("not.have.class", "disabled")
            .click();
        return this;
    }

    getHiddenIcon() {
        return this.getDateFilterElement().find(".s-gd-icon-invisible");
    }

    isHiddenIconVisible() {
        this.getHiddenIcon().should("be.visible");
        return this;
    }

    hoverOnHiddenIcon() {
        this.getHiddenIcon().realHover();
        return this;
    }

    getLockedIcon() {
        return this.getDateFilterElement().find(".s-gd-icon-lock");
    }

    isLockedIconVisible() {
        this.getLockedIcon().should("be.visible");
        return this;
    }

    hoverOnLockedIcon() {
        this.getLockedIcon().trigger("mouseover");
        return this;
    }

    hasDropdownBodyOpen(expected = true) {
        this.getDropdownElement().should(expected ? "be.visible" : "not.exist");
        return this;
    }

    hasConfigurationModeCheckedAt(mode: DashboardDateFilterConfigMode) {
        this.getConfigurationMode(mode).should("have.attr", "checked");
        return this;
    }
}
