// (C) 2023 GoodData Corporation

import Chainable = Cypress.Chainable;

export class Button {
    readonly element: Chainable<JQuery>;

    constructor(selector: string) {
        this.element = cy.get(selector);
    }

    isEnabled(expected = true) {
        this.element.should(expected ? "not.have.class" : "have.class", "disabled");
        return this;
    }

    isVisible(expected = true) {
        this.element.should(expected ? "exist" : "not.exist");
        return this;
    }

    click() {
        this.element.click();
        return this;
    }
}
