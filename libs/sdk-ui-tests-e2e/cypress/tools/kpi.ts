// (C) 2021 GoodData Corporation

export class Kpi {
    constructor(private parentSelector: string) {}

    getContentElement() {
        return cy.get(this.parentSelector).find(".s-dashboard-kpi-component");
    }

    getValueElement() {
        return this.getContentElement().find(".s-kpi-value");
    }

    hasValue(value: string) {
        this.getValueElement().should("have.text", value);
        return this;
    }

    clickValue() {
        this.getValueElement().click();
        return this;
    }

    isClickable() {
        this.getContentElement().find(".s-kpi-link-clickable").should("exist");
        return this;
    }
}
