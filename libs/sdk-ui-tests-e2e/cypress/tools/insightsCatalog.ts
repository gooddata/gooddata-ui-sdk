// (C) 2021-2025 GoodData Corporation

import { getTestClassByTitle } from "../support/commands/tools/classes";
import { MDObjects } from "../support/getMDObjects";

export type InsightTitle = keyof typeof MDObjects.Insights;
export type DashboardName = keyof typeof MDObjects.Dashboards;

export function splitCamelCaseToWords(str: string) {
    return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s./g, (match) => match.toLowerCase());
}

export function getInsightSelectorFromInsightTitle(insightTitle: InsightTitle) {
    // convert camel case which is used in the exported catalog to snake case used in s-classes
    const insightTitleReconstructed = insightTitle
        .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
        .slice(1);
    return `${getTestClassByTitle(insightTitleReconstructed)}`;
}

export class InsightsCatalog {
    getElementSelector(itemSelector: string) {
        return `.gd-visualizations-list ${itemSelector}`;
    }

    searchExistingInsight(insightTitle: InsightTitle) {
        this.clearSearch();
        this.searchText(splitCamelCaseToWords(insightTitle));
        return this;
    }

    searchText(text: string) {
        this.clearSearch();
        cy.get(this.getElementSelector(".gd-input-field")).should("exist");
        cy.get(this.getElementSelector(".gd-input-field")).type(text);
        this.waitForCatalogReload();
        return this;
    }

    clearSearch() {
        cy.get(this.getElementSelector(".gd-input-field")).should("exist");
        cy.get(this.getElementSelector(".gd-input-field")).clear();
        this.waitForCatalogReload();
        return this;
    }

    waitForCatalogLoad() {
        cy.get(this.getElementSelector(".s-isLoading")).should("not.exist");
        cy.get(this.getElementSelector(".gd-input-field")).should("exist");
        return this;
    }

    waitForCatalogReload() {
        cy.get(this.getElementSelector(".s-isLoading")).should("not.exist");
        cy.get(this.getElementSelector(".s-isLoading")).should("not.exist");
        return this;
    }

    getInsightSelector(insightTitle: InsightTitle) {
        return `.gd-visualizations-list ${getInsightSelectorFromInsightTitle(insightTitle)}`;
    }

    clickTab(tabLabel: string) {
        cy.get(this.getElementSelector(".gd-tab")).contains(tabLabel).parents(".gd-tab").click();
        return this;
    }

    tabIsActive(tabLabel: string, expect = true) {
        cy.get(this.getElementSelector(".gd-tab"))
            .contains(tabLabel)
            .parents(".gd-tab")
            .should(expect ? "have.class" : "not.have.class", "is-active");
        return this;
    }

    hasNoDataMessage() {
        cy.get(this.getElementSelector(".s-visualization-list-no-data-message"))
            .contains("No visualization matched.")
            .should("exist");
        return this;
    }
}
