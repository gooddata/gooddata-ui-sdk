// (C) 2021-2025 GoodData Corporation

import { Widget } from "./widget";
import { getTestClassByTitle } from "../support/commands/tools/classes";

export type InteractionType = "measure" | "attribute";
export class WidgetConfiguration {
    constructor(
        private widgetIndex: number,
        private section: number = 0,
    ) {}

    getElement() {
        return cy.get(".s-gd-configuration-bubble");
    }

    open() {
        new Widget(this.widgetIndex, this.section).getElement().click();
        this.getElement().should("be.visible");
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

    hasInteractions(expected = true) {
        this.getElement()
            .contains("Interactions")
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    hasInteractionItems(expected = true) {
        this.getElement()
            .find(".s-drill-config-item")
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    openInteractions() {
        this.getElement().contains("Interactions").click();
        this.getElement().find(".s-drill-config-panel").should("be.visible");
        return this;
    }

    closeCustomURLDialog() {
        cy.get(".s-dialog-cancel-button").click();
        return this;
    }

    addInteraction(itemName: string, itemType: InteractionType) {
        const itemSelector = `.s-drill-${itemType}-selector-item`;

        this.getElement().find(".s-drill-config-panel .s-add_interaction").click();
        cy.get(`.s-drill-item-selector-dropdown ${itemSelector}`).contains(itemName).click();
        return this;
    }

    openConfiguration() {
        this.getElement().contains("Configuration").click();
        this.getElement().find(".s-viz-filters-headline").should("be.visible");
        return this;
    }

    getListFilterItem() {
        const result = [] as string[];
        this.getElement()
            .find(".s-attribute-filter-by-item")
            .each(($li) => {
                return result.push($li.text());
            });
        return cy.wrap(result);
    }

    isFilterItemVisible(attributeName: string, expected = true) {
        this.getElement()
            .find(".s-viz-filters-panel .s-attribute-filter-by-item")
            .contains(attributeName)
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    toggleAttributeFilter(attributeName: string) {
        this.getElement()
            .find(".s-viz-filters-panel .s-attribute-filter-by-item")
            .contains(attributeName)
            .click();
        return this;
    }

    enableDateFilter() {
        cy.get("body").then((body) => {
            if (body.find(".s-filter-date-dropdown").length == 0) {
                this.toggleDateFilter();
            }
        });
        return this;
    }

    disableDateFilter() {
        cy.get("body").then((body) => {
            if (body.find(".s-filter-date-dropdown").length > 0) {
                this.toggleDateFilter();
            }
        });
        return this;
    }

    isDateDatasetDropdownExist(name: string, exist = true) {
        const className = getTestClassByTitle(name);
        cy.get(`.s-date-dataset-button${className}`).should(exist ? "exist" : "not.exist");
        return this;
    }

    toggleDateFilter() {
        this.getElement().find(".s-date-filter-by-item").click();
        return this;
    }

    clickLoadedDateDatasetButton() {
        this.getElement()
            .find(".s-date-dataset-button")
            .should("not.contain.text", "Loading")
            .scrollIntoView()
            .click();
        return this;
    }

    selectDateDataset(datasetName: string) {
        this.clickLoadedDateDatasetButton();
        cy.get(".configuration-dropdown.dataSets-list").find(".gd-list-item").contains(datasetName).click();
        return this;
    }

    hasDatasetSelected(datasetName: string) {
        this.clickLoadedDateDatasetButton();
        cy.get(".configuration-dropdown.dataSets-list")
            .find(".gd-list-item")
            .contains(datasetName)
            .parent(".gd-list-item")
            .should("have.class", "is-selected");
        return this;
    }

    getDrillConfigItem(itemName: string) {
        return new DrillConfigItem(itemName);
    }

    removeFromDashboard() {
        cy.get(".s-delete-insight-item").click();
        return this;
    }

    selectFilterCheckbox(text: string) {
        this.getElement().scrollIntoView();

        // eslint-disable-next-line cypress/unsafe-to-chain-command
        cy.get(`.s-attribute-filter-configuration ${text}`)
            .should("exist")
            .scrollIntoView()
            .find('input[type="checkbox"]')
            .check();

        return this;
    }
}

type DrillType = "Drill into insight" | "Drill into dashboard" | "Drill into URL";

class DrillConfigItem {
    constructor(private itemName: string) {}

    getElement() {
        const selector = getTestClassByTitle(this.itemName, "drill-config-item-");
        cy.get(selector).contains("Loading…").should("not.exist");
        return cy.get(selector);
    }

    chooseAction(drillType: DrillType) {
        this.getElement().find(".s-drill-config-panel-target-button").click();
        cy.get(".s-drill-config-panel-target-type-open").contains(drillType).click();
        return this;
    }

    remove() {
        this.getElement().find(".s-drill-config-item-delete").click();
        return this;
    }

    clickTargetUrlButton() {
        this.getElement().find(".s-drill-to-url-button").invoke("show").click();
        return this;
    }

    openCustomUrlEditor() {
        this.clickTargetUrlButton();
        cy.get(".s-drill-to-custom-url-button").click();
        return this;
    }

    hasWarning(warning: string) {
        this.getElement().find(".s-drill-config-target-warning").should("contain.text", warning);
        return this;
    }
}

export class CustomURLDialog {
    getElement() {
        return cy.get(".s-gd-drill-custom-url-editor");
    }

    hasItem(title: string) {
        this.getElement().find(".gd-list-item").contains(`${title}`);
        return this;
    }
}
