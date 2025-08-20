// (C) 2022-2025 GoodData Corporation

import { Button } from "./Button";

const ATTR_DISPLAY_FORM_BUTTON = ".s-attribute-display-form-button";

export class AttributeFilterConfiguration {
    constructor(private parentSelector: string) {}

    getElementSelector() {
        return this.parentSelector;
    }

    clickElement(elementSelector: string): this {
        cy.get(elementSelector).click();
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

    toggleDisplayFormButton() {
        cy.get(ATTR_DISPLAY_FORM_BUTTON).click();
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

    changeAttributeTitle(title: string) {
        const inputTitle = title || "{backspace}";
        cy.get(".s-configuration-attribute-filter-title .gd-input-field").clear().type(inputTitle);
        return this;
    }

    getSaveButton() {
        return new Button(".gd-attribute-filter-apply-button__next.s-save");
    }

    cancel() {
        cy.get(".dropdown-body .cancel-button").click();
        return this;
    }
}
