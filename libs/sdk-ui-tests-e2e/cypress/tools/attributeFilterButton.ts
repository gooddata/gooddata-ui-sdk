// (C) 2022 GoodData Corporation
export class AttributeFilterButton {
    private attributeFilterUniqueSelector;

    constructor(selector: string) {
        this.attributeFilterUniqueSelector = selector;
    }

    open(): this {
        cy.get(this.attributeFilterUniqueSelector).click();
        return this;
    }

    openConfiguration(): this {
        cy.wait(300);
        cy.get(".s-attribute-filter-dropdown-configuration-button").click();
        return this;
    }

    titleHasText(expectedTitle: string): this {
        cy.get(`${this.attributeFilterUniqueSelector} .s-attribute-filter-button-title`).should(
            "have.text",
            expectedTitle,
        );
        return this;
    }

    subtitleHasText(expectedSubtitle: string): this {
        cy.get(`${this.attributeFilterUniqueSelector} .s-attribute-filter-button-subtitle`).should(
            "have.text",
            expectedSubtitle,
        );
        return this;
    }

    statusHasText(expectedSubtitle: string): this {
        cy.get(".s-dropdown-attribute-selection-list").should("have.text", expectedSubtitle);
        return this;
    }

    statusHasAll(): this {
        cy.get(".s-list-status-bar b").should("have.text", "All");
        return this;
    }

    statusHasNone(): this {
        cy.get(".s-list-status-bar b").should("have.text", "None");
        return this;
    }

    clearSelection(): this {
        cy.get(".s-select-all-checkbox").click();
        return this;
    }

    selectAll(): this {
        cy.get(".s-select-all-checkbox").click();
        return this;
    }

    selectElement(element: string): this {
        cy.wait(200).get(element).click();
        return this;
    }

    applyDisabled(disabled = true): this {
        cy.get(".s-apply").should(disabled ? "have.class" : "not.have.class", "disabled");
        return this;
    }

    clickApply(): this {
        cy.get(".s-apply").click();
        return this;
    }

    clickCancel(): this {
        cy.get(".s-cancel").click();
        return this;
    }

    scrollDown(): this {
        cy.get(".ScrollbarLayout_main").trigger("wheel", {});
        return this;
    }

    waitElementsLoaded(): this {
        // wait until loading is finished
        cy.wait(500).get(".s-isLoading").should("not.exist");
        return this;
    }

    searchElements(query: string): this {
        cy.get(".gd-input-search .gd-input-field").focus().type(query);
        return this;
    }

    isFilteredElementsCount(elementCount: number): this {
        cy.get(".s-attribute-filter-list-item").should("have.length", elementCount);
        return this;
    }

    elementsCorrespondToQuery(query: string): this {
        cy.get(".s-attribute-filter-list-item").each((item) => {
            cy.wrap(item).should("include.text", query);
        });
        return this;
    }

    isAllElementsFiltered(): this {
        cy.get(".gd-no-data").should("exist");
        return this;
    }

    isAllElementsFilteredByParent(): this {
        cy.get(".s-attribute-filter-dropdown-all-items-filtered").should("exist");
        return this;
    }

    waitFilteringFinished(): this {
        cy.get(`${this.attributeFilterUniqueSelector}.gd-is-filtering`).should("exist");
        cy.get(`${this.attributeFilterUniqueSelector}.gd-is-filtering`).should("not.exist");
        return this;
    }

    allElementsSelected(): this {
        cy.get(".s-attribute-filter-list-item").each((listItem) => {
            cy.wrap(listItem).should("have.class", "s-attribute-filter-list-item-selected");
        });
        return this;
    }
}
