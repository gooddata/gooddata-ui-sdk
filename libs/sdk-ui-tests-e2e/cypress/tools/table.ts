// (C) 2021 GoodData Corporation

export class Table {
    constructor(private parentSelector: string) {}

    getElement(): Cypress.Chainable {
        return cy.get(this.parentSelector).find(".s-pivot-table");
    }

    private waitLoaded(): this {
        this.getElement().find(".s-loading").should("not.exist");
        this.getElement().find(".s-loading-done").should("exist");
        return this;
    }

    click(rowIndex: number, columnIndex: number): void {
        this.waitLoaded();

        this.getElement()
            .find(`.gd-cell-drillable.s-cell-${rowIndex}-${columnIndex} .s-value`)
            .first()
            .click();
    }
}
