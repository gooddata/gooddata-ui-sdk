// (C) 2021-2025 GoodData Corporation
import { WidgetDropZone } from "./enum/DropZone";
import { LayoutRow } from "./layoutRow";
import { Widget } from "./widget";
import { getMaximumTimeout } from "../support/constants";

export class Dashboard {
    getElement(element: string): Cypress.Chainable {
        return cy.get(element);
    }

    hasError(): this {
        cy.get(".s-error").should("exist");
        return this;
    }

    getTopBarElement(): Cypress.Chainable {
        return cy.get(".s-top-bar");
    }

    getFilterBarElement(): Cypress.Chainable {
        return cy.get(".s-gd-dashboard-filter-bar");
    }

    getDashboardBodyElement(): Cypress.Chainable {
        return cy.get(".gd-grid-layout__container--root");
    }

    topBarExist(exist = true): this {
        this.getElement(".s-top-bar").should(exist ? "exist" : "not.exist");
        return this;
    }

    filterBarExist(exist = true): this {
        this.getElement(".s-gd-dashboard-filter-bar").should(exist ? "exist" : "not.exist");
        return this;
    }

    dashboardBodyExist(exist = true): this {
        this.getDashboardBodyElement().should(exist ? "exist" : "not.exist");
        return this;
    }

    waitForDashboardLoaded() {
        cy.get(".catalog-is-loaded").should("exist");
        cy.get(".accessible-dashboards-loaded").should("exist");
        return this;
    }

    moveWidget(fromIndex: number, toIndex: number, dropzone: WidgetDropZone) {
        const dataTransfer = new DataTransfer();
        cy.get(".dash-item-content").eq(fromIndex).trigger("dragstart", { dataTransfer });

        cy.get(".s-dash-item")
            .eq(toIndex)
            .parents(".gd-fluidlayout-column-container")
            .find(dropzone)
            .trigger("dragover", { dataTransfer })
            .trigger("drop", { dataTransfer });
        return this;
    }

    getWidgetList() {
        const result = [] as string[];
        cy.get(".visualization .item-headline").each(($li) => {
            result.push($li.text());
        });
        return cy.wrap(result);
    }

    getRow(rowIndex: number): LayoutRow {
        return new LayoutRow(rowIndex);
    }

    hasRowsCount(count: number) {
        cy.get(".gd-grid-layout__section").should("have.length", count);
        return this;
    }

    getWidget(itemIndex: number): Widget {
        return new Widget(itemIndex);
    }

    hasPlaceholderText(text: string) {
        cy.get(".drag-info-placeholder-inner.can-drop").contains(text);
        return this;
    }

    hasDropTargetBorderActive() {
        cy.get(".gd-grid-layout-dropzone__drop-target-border").should("exist");
        return this;
    }

    waitItemLoaded() {
        cy.wait(500);
        this.getDashboardBodyElement()
            .find(".dash-item.type-loading", { timeout: getMaximumTimeout() })
            .should("not.exist");
    }

    isLoaded() {
        cy.get(".catalog-is-loaded .dash-section").should("exist");
        cy.get(".s-loading-spinner").should("not.exist");
        cy.get(".s-loading", { timeout: 60000 }).should("not.exist");
        return this;
    }
}

export class TopBar {
    getElement(element: string): Cypress.Chainable {
        return cy.get(element);
    }

    getEditButtonElement(): Cypress.Chainable {
        return this.getElement(".s-edit_button");
    }

    getShareButtonElement(): Cypress.Chainable {
        return cy.get(".s-header-share-button");
    }

    getMenuButtonElement(): Cypress.Chainable {
        return this.getElement(".s-header-options-button");
    }

    getDeleteButtonElement(): Cypress.Chainable {
        return this.getElement(".s-delete_dashboard");
    }

    enterEditMode() {
        cy.get(".s-top-bar .s-edit:not(.disabled)").click();
        return this;
    }

    cancelEditMode() {
        cy.get(".s-top-bar .s-cancel").click();
        return this;
    }

    discardChanges() {
        cy.get(".s-discard_changes").click();
        return this;
    }

    getFilterBarElement(): Cypress.Chainable {
        return this.getElement("");
    }

    dashboardTitleExist(exist = true): this {
        this.getElement(".s-gd-dashboard-title").should(exist ? "exist" : "not.exist");
        return this;
    }

    shareButtonExists(exist = true): this {
        this.getShareButtonElement().should(exist ? "exist" : "not.exist");
        return this;
    }

    clickShareButton(): this {
        this.getShareButtonElement().click();
        return this;
    }

    dashboardTitleHasValue(value: string): this {
        this.getElement(".s-gd-dashboard-title").should("have.text", value);
        return this;
    }

    editButtonIsVisible(visible = true): this {
        this.getEditButtonElement().should(visible ? "exist" : "not.exist");
        return this;
    }

    hasDeleteButton(expect = true): this {
        this.getDeleteButtonElement().should(expect ? "exist" : "not.exist");
        return this;
    }

    menuButtonIsVisible(visible = true): this {
        this.getMenuButtonElement().should(visible ? "exist" : "not.exist");
        return this;
    }

    topBarMenuItemExist(element: string, exist = true): this {
        this.getElement(element).should(exist ? "exist" : "not.exist");
        return this;
    }

    clickMenuButton(): this {
        this.getMenuButtonElement().click({ force: true });
        return this;
    }

    getDashboardTitleElement(): this {
        cy.get(".s-gd-dashboard-title");
        return this;
    }

    getMenuButtonItemElement(itemClass: string): this {
        cy.get(`.${itemClass}`);
        return this;
    }

    enterSharing(): this {
        this.shareButtonExists();
        this.clickShareButton();
        return this;
    }
}

export class FilterBar {
    private getElement(element: string): Cypress.Chainable {
        return cy.get(element);
    }
    private getDateFilterElement(): Cypress.Chainable {
        return this.getElement(".s-date-filter-button");
    }

    dateFilterExist(exist = true): this {
        this.getDateFilterElement().should(exist ? "exist" : "not.exist");
        return this;
    }

    dateFilterHasTitle(text: string): this {
        this.getElement(".s-date-filter-title").should("have.text", text);
        return this;
    }

    clickDateFilter(): this {
        this.getDateFilterElement().click();
        return this;
    }

    dateFilterHasElements(elements: string[]): this {
        elements.forEach((element) => this.getElement(element).should("exist"));
        return this;
    }

    dateFilterHasSubtitle(subtitle: string): this {
        this.getElement(".s-button-text").should("have.text", subtitle);
        return this;
    }

    selectDateFilterOption(option: string): this {
        this.getElement(option).click({ force: true });
        return this;
    }

    clickApply(): this {
        this.getElement(".s-date-filter-apply").click();
        return this;
    }
}

export class DashboardBody {}
