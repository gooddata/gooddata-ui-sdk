// (C) 2022 GoodData Corporation

export class AttributeFilterConfiguration {
    constructor(private parentSelector: string) {}

    getElementSelector() {
        return this.parentSelector;
    }

    clickElement(elementSelector: string): this {
        cy.get(elementSelector).click();
        cy.wait(200);
        return this;
    }

    isSaveButtonDisabled(): this {
        cy.get(".s-attribute-filter-dropdown-configuration-save-button").should(
            "have.class",
            "gd-button disabled",
        );
        return this;
    }

    isItemSelected(elementSelector: string): this {
        cy.get(elementSelector).should("have.class", "is-selected");
        return this;
    }

    isItemDisabled(elementSelector: string): this {
        cy.get(elementSelector).find("input").should("be.disabled");
        return this;
    }

    isConnectingAttributeDropdown(): this {
        cy.get(".s-connecting-attributes-dropdown").should("exist");
        return this;
    }

    isConnectingDropdownOpen(): this {
        cy.get(".s-connecting-attributes-dropdown-body").should("exist");
        return this;
    }

    selectConnectingAttribute(connectingAttributeItemSelector: string): this {
        cy.get(".s-connecting-attributes-dropdown-body").find(connectingAttributeItemSelector).click();
        return this;
    }

    isConnectingAttributeSelected(title: string): this {
        cy.get(".s-connecting-attributes-dropdown").find(".gd-button-text").should("have.text", title);
        return this;
    }

    selectDisplayForm(displayFormSelector: string): this {
        cy.get(".s-attribute-display-form-dropdown-body").find(displayFormSelector).click();
        return this;
    }

    isDisplayFormSelected(displayFormTitle: string): this {
        cy.get(".s-attribute-display-form-button")
            .find(".gd-button-text")
            .should("have.text", displayFormTitle);
        return this;
    }
}
