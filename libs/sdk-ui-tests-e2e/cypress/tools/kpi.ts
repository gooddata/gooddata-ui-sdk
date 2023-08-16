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

    isEmptyValue() {
        this.getContentElement().find(".kpi-value").should("have.class", "is-empty-value");
        return this;
    }

    hasPOPSection(expected = true) {
        this.getContentElement()
            .find(".headline-compare-section")
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    hasCompareTitle(title: string) {
        this.getContentElement().find(".headline-title-wrapper").should("have.text", title);
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
