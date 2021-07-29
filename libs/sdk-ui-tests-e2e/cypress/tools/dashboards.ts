// (C) 2021 GoodData Corporation

import { getTestClassByTitle } from "./utils";

export class Dashboard {
    constructor(private name: string) {}

    getElement(): Cypress.Chainable {
        const testClass = getTestClassByTitle(this.name);
        return cy.get(testClass);
    }

    getTopBarElement(): Cypress.Chainable {
        const topBarClass = ".s-top-bar";
        return cy.get(topBarClass);
    }

    getFilterBarElement(): Cypress.Chainable {
        return cy.get(".s-gd-dashboard-filter-bar");
    }

    getDashboardBody(): Cypress.Chainable {
        return cy.get(".s-fluid-layout-container");
    }
}

export class TopBar {
    getDashboardTitleElement(): Cypress.Chainable {
        return cy.get(".s-gd-dashboard-title");
    }

    getEditButtonElement(): Cypress.Chainable {
        return cy.get(".s-edit_button");
    }

    getMenuButtonElement(): Cypress.Chainable {
        return cy.get(".s-header-options-button");
    }

    getMenuButtonItemElement(itemClass: string): Cypress.Chainable {
        return cy.get(`.${itemClass}`);
    }
}

export class FilterBar {
    getDateFilterElement(): Cypress.Chainable {
        return cy.get(".s-date-filter-button");
    }

    getDateFilterTitleElement(): Cypress.Chainable {
        return cy.get(".s-date-filter-title");
    }

    getDateFilterBodyElement(groupClass: string): Cypress.Chainable {
        return cy.get(`.${groupClass}`);
    }

    getDateFilterSubtitleElement(): Cypress.Chainable {
        return cy.get(".s-button-text");
    }
}

export class DashboardBody {}
