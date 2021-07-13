// (C) 2021 GoodData Corporation

import { getTestClassByTitle } from "./utils";

export class Dashboard {
    constructor(private name: string) {}

    getElement() {
        const testClass = getTestClassByTitle(this.name);
        return cy.get(testClass);
    }

    getTopBarElement() {
        const topBarClass = ".s-top-bar";
        return cy.get(topBarClass);
    }

    getFilterBarElement() {
        return cy.get(".s-gd-dashboard-filter-bar");
    }

    getDashboardBody() {
        return cy.get(".s-fluid-layout-container");
    }
}

export class TopBar {
    getDashboardTitleElement() {
        return cy.get(".s-gd-dashboard-title");
    }

    getEditButtonElement() {
        return cy.get(".s-edit_button");
    }

    getMenuButtonElement() {
        return cy.get(".s-header-options-button");
    }

    getMenuButtonItemElement(itemClass: string) {
        return cy.get(`.${itemClass}`);
    }
}

export class FilterBar {
    getDateFilterElement() {
        return cy.get(".s-date-filter-button");
    }

    getDateFilterTitleElement() {
        return cy.get(".s-date-filter-title");
    }

    getDateFilterBodyElement(groupClass: string) {
        return cy.get(`.${groupClass}`);
    }

    getDateFilterSubtitleElement() {
        return cy.get(".s-button-text");
    }
}

export class DashboardBody {}
