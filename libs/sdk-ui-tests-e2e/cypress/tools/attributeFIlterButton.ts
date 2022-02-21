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

    applyDisabled(): this {
        cy.get(".s-apply").should("have.class", "disabled");
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
}
