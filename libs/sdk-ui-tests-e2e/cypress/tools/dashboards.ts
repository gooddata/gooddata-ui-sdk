// (C) 2021 GoodData Corporation

import { WidgetDropZone } from "./enum/DropZone";

export class Dashboard {
    getElement(element: string): Cypress.Chainable {
        return cy.get(element);
    }

    getTopBarElement(): Cypress.Chainable {
        return cy.get(".s-top-bar");
    }

    getFilterBarElement(): Cypress.Chainable {
        return cy.get(".s-gd-dashboard-filter-bar");
    }

    getDashboardBodyElement(): Cypress.Chainable {
        return cy.get(".s-fluid-layout-container");
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

    moveWidget(fromIndex: number, toIndex: number, dropzone: WidgetDropZone) {
        const dataTransfer = new DataTransfer();
        cy.get(".dash-item-content").eq(fromIndex).trigger("dragstart", {
            dataTransfer,
        });

        cy.get(".s-dash-item").eq(toIndex).trigger("dragover", "center", {
            dataTransfer,
            force: true,
        });

        cy.get(".s-dash-item")
            .eq(toIndex)
            .parents(".gd-fluidlayout-column-container")
            .find(dropzone)
            .trigger("drop", {
                dataTransfer,
            });
        return this;
    }

    getWidgetList() {
        const result = [] as string[];
        cy.get(".visualization .item-headline").each(($li) => {
            return result.push($li.text());
        });
        return cy.wrap(result);
    }
}

export class TopBar {
    getElement(element: string): Cypress.Chainable {
        return cy.get(element);
    }

    getEditButtonElement(): Cypress.Chainable {
        return this.getElement(".s-edit_button");
    }

    getMenuButtonElement(): Cypress.Chainable {
        return this.getElement(".s-header-options-button");
    }

    getFilterBarElement(): Cypress.Chainable {
        return this.getElement("");
    }

    dashboardTitleExist(exist = true): this {
        this.getElement(".s-gd-dashboard-title").should(exist ? "exist" : "not.exist");
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

    menuButtonIsVisible(visible = true): this {
        this.getMenuButtonElement().should(visible ? "exist" : "not.exist");
        return this;
    }

    topBarMenuItemExist(element: string, exist = true): this {
        this.getElement(element).should(exist ? "exist" : "not.exist");
        return this;
    }

    clickMenuButton(): this {
        this.getMenuButtonElement().click();
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
        this.getElement(option).click();
        return this;
    }

    clickApply(): this {
        this.getElement(".s-date-filter-apply").click();
        return this;
    }
}

export class DashboardBody {}
