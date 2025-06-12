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

    measureDropdownIsOpen() {
        this.getElement().find(".s-metric_select .gd-button").should("have.class", "is-active");
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

    hasHeadingsDisabled() {
        this.getElement().find("h3").should("have.class", "is-disabled");
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

    isErrorVisible(expect = true) {
        this.getElement()
            .find(".s-no-related-date")
            .should(expect ? "exist" : "not.exist");
        return this;
    }

    close() {
        this.getElement().find("[data-id='s-configuration-panel-header-close-button']").click();
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

    selectTargetOldDashboard(oldDashboardtabTitle: string) {
        this.getElement().find(".gd-button").contains("Select a dashboard").click();
        new DrillToOldDashboardDropdown().clickOption(oldDashboardtabTitle);
    }

    drillToOldDashboardDropdownVisible(expect: boolean = true) {
        this.getElement()
            .find(".s-drill-to-dropdown")
            .should(expect ? "be.visible" : "not.exist");
    }

    switchWidgetDescriptionMode(mode: string) {
        this.getElement().find(".s-description-config-dropdown-button").click();
        cy.get(`.s-${mode}`).click();
        return this;
    }

    hasDescriptionField(text: string) {
        this.getElement().find(".gd-input-field").should("have.text", text);
        return this;
    }

    setDescriptionField(text: string) {
        this.getElement().find(".gd-input-field").clear().type(text);
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

export class DrillToOldDashboardDropdown {
    getElement() {
        return cy.get(".s-drill-to-list");
    }

    clickOption(oldDashboardtabTitle: string) {
        this.getElement().find(".gd-list-item").contains(oldDashboardtabTitle).click();
    }
}
