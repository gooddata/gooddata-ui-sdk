// (C) 2022 GoodData Corporation
export class AttributeFilterButton {
    open(): this {
        cy.get(".s-attribute-filter").click();
        return this;
    }

    titleHasText(expectedTitle: string): this {
        cy.get(".s-attribute-filter-button-title").should("have.text", expectedTitle);
        return this;
    }

    subtitleHasText(expectedSubtitle: string): this {
        cy.get(".s-attribute-filter-button-subtitle").should("have.text", expectedSubtitle);
        return this;
    }

    clearSelection(): this {
        cy.get(".s-clear").click();
        return this;
    }

    selectAll(): this {
        cy.get(".s-select_all").click();
        return this;
    }

    selectElement(element: string): this {
        cy.get(`.s-attribute-filter-list-item-${element}`).click();
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
        // wait until loading is initialized
        cy.get(".s-isLoading").should("exist");
        // wait until loading is finished
        cy.get(".s-isLoading").should("not.exist");
        return this;
    }

    searchElements(query: string): this {
        cy.get(".s-attribute-filter-button-search-field .gd-input-field").focus().type(query);
        return this;
    }

    isFilteredElementsCount(elementCount: number): this {
        cy.get(".s-attribute-filter-list-item").should("have.length", elementCount);
        return this;
    }

    elementsCorrespondToQuery(query: string): this {
        cy.get(".s-attribute-filter-list-item span").each((item) => {
            cy.wrap(item).should("include.text", query);
        });
        return this;
    }

    isAllElementsFiltered(): this {
        cy.get(".s-list-no-results").should("exist");
        return this;
    }
}
