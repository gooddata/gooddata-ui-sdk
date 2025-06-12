// (C) 2024-2025 GoodData Corporation
export class AttributeFilterLimit {
    getElement() {
        return cy.get(".attribute-filter__limit__popup");
    }

    addMetric() {
        this.getElement().find(".s-add-limit-metric").click();
        return this;
    }

    getListFilterByMetric() {
        return this.getElement().find(".attribute-filter__limit__popup__list--searchable");
    }

    getListFilterDependency() {
        return this.getElement().find(".attribute-filter__limit__popup__list");
    }

    getListFilterDependencyName() {
        return this.getListFilterDependency().find(".attribute-filter__limit__item__name");
    }

    selectMetricItem(item: string) {
        this.getListFilterByMetric()
            .find(".attribute-filter__limit__popup__item[title='" + item + "']")
            .click();
        return this;
    }

    searchMetricItem(item: string) {
        this.getListFilterByMetric()
            .find(".gd-input-search input")
            .as("searchField")
            .should("be.visible")
            .clear();
        cy.get("@searchField").type(item);
        return this;
    }

    getNodata(exists = true) {
        cy.get(".attribute-filter__limit__popup__no-data").should(exists ? "exist" : "not.exist");
        cy.get("[data-id='s-configuration-panel-header-close-button']").click();
        return this;
    }
}
