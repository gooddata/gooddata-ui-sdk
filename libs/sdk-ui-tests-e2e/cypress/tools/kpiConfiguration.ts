// (C) 2021-2025 GoodData Corporation

import { Widget } from "./widget";

export class KpiConfiguration {
    constructor(private widgetIndex: number) {}

    getElement() {
        return cy.get(".s-gd-configuration-bubble");
    }

    open() {
        new Widget(this.widgetIndex).getElement().click();
        this.getElement().should("be.visible");
        return this;
    }

    isOpen(expect = true) {
        this.getElement().should(expect ? "exist" : "not.exist");
        return this;
    }

    toggleMeasureDropdown() {
        this.getElement().find(".s-metric_select .gd-button").click();
        return this;
    }

    chooseMeasure(measureName: string) {
        new KPIMeasureDropdown().find(measureName).clickItem(measureName);
        return this;
    }

    openComparisonDropdown() {
        this.getElement().then((body) => {
            if (body.find(".comparison-list").length < 1) {
                this.getElement().find(".s-compare_with_select .gd-button").scrollIntoView().click();
            }
        });
        return this;
    }

    chooseComparison(comparisonType: string) {
        new KPIComparisonDropdown().clickItem(comparisonType);
        return this;
    }

    isDateDropdownLoaded() {
        this.getElement().find(".gd-kpi-date-dataset-dropdown .gd-spinner").should("not.exist");
        this.getElement().find(".s-date-dataset-button.s-loading_").should("not.exist");
        return this;
    }

    selectedDataset(dataset: string) {
        cy.get(`.s-date-dataset-button.s-${dataset}`).should("exist");
        return this;
    }

    close() {
        this.getElement()
            .find(
                "[data-id='s-configuration-panel-header-close-button'], [data-id='s-submenu-header-close-button']",
            )
            .click();
        this.getElement().should("not.exist");
        return this;
    }

    openDateDataset() {
        this.getElement().find(".s-date-dataset-button").click();
        return this;
    }

    getDateDatasets() {
        const result = [] as string[];
        cy.get(".dataSets-list .gd-list-item-shortened").each(($li) => {
            return result.push($li.text());
        });
        return cy.wrap(result);
    }

    selectDateDataset(dataset: string) {
        cy.get(`.dataSets-list .s-${dataset}`).click();
        return this;
    }

    clickOutside() {
        cy.get(".s-gd-fluid-layout-row").first().click("right");
        return this;
    }
}

export class KPIComparisonDropdown {
    getElement() {
        return cy.get(".comparison-list");
    }

    clickItem(comparisonType: string) {
        this.getElement().find(".gd-list-item").contains(comparisonType).click();
        return this;
    }
}

export class KPIMeasureDropdown {
    getElement() {
        return cy.get(".s-metrics-list");
    }

    find(measureName: string) {
        this.getElement().find(".gd-input-field").type(measureName, {
            delay: 100,
        });
        return this;
    }

    clickItem(measureName: string) {
        this.getElement().find(".gd-list-item").contains(measureName).click();
        return this;
    }

    searchBoxIsEmpty() {
        this.getElement().find(".gd-input-field").should("be.empty");
        return this;
    }

    noMatchingData() {
        this.getElement().find(".gd-no-matching-data").should("exist");
        return this;
    }
}
