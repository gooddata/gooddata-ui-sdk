// (C) 2022-2024 GoodData Corporation
export class Headline {
    constructor(private parentSelector: string) {}

    getElementSelector() {
        return this.parentSelector;
    }

    getElement() {
        return cy.get(this.getElementSelector());
    }

    waitLoaded() {
        this.getElement().find(".s-loading").should("not.exist");
        return this;
    }

    getContainer() {
        return this.getElement().find(".headline");
    }

    getPrimaryItem() {
        return this.getElement().find(".s-headline-primary-item");
    }

    getPrimaryValue() {
        return this.getPrimaryItem().find(".s-headline-value");
    }

    clickPrimaryValue() {
        this.getPrimaryValue().click();
        return this;
    }

    hasValue(value: string) {
        this.getPrimaryItem().find(".s-headline-value").should("have.text", value);
        return this;
    }

    hasEmpty() {
        cy.get(".visualization-empty").should("exist");
    }

    isValue(exist: boolean = false) {
        this.getElement()
            .get(".s-headline-value")
            .should(exist ? "exist" : "not.exist");
        return this;
    }
}
