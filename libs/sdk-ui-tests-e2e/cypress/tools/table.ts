// (C) 2021 GoodData Corporation

const AUTO_SIZE_TOLERANCE = 10;

export const nonEmptyValue = /\$?[0-9,.]+/;

export type positionType =
    | "topLeft"
    | "top"
    | "topRight"
    | "left"
    | "center"
    | "right"
    | "bottomLeft"
    | "bottom"
    | "bottomRight";
export class Table {
    constructor(private parentSelector: string) {}

    getElement(): Cypress.Chainable {
        return cy.get(this.parentSelector).find(".s-pivot-table");
    }

    public waitLoaded(): this {
        this.getElement().find(".s-loading").should("not.exist");
        this.getElement().find(".s-loading-done").should("exist");
        return this;
    }

    public waitRowLoaded(): this {
        this.getElement().find(".s-loading").should("not.exist");
        cy.wait(200);
        return this;
    }

    click(rowIndex: number, columnIndex: number): void {
        this.waitLoaded();

        this.getElement()
            .find(`.gd-cell-drillable.s-cell-${rowIndex}-${columnIndex} .s-value`)
            .should("exist");

        this.getElement()
            .find(`.gd-cell-drillable.s-cell-${rowIndex}-${columnIndex} .s-value`)
            .first()
            .click();
    }

    getCell(rowIndex: number, columnIndex: number) {
        return this.getElement().find(".ag-body-viewport").find(`.s-cell-${rowIndex}-${columnIndex}`);
    }

    hasCellWidth(rowIndex: number, columnIndex: number, expectedWidth: number, withTolerance = false) {
        const columnWidth = this.getCell(rowIndex, columnIndex).invoke("outerWidth");

        columnWidth.then((v) => {
            cy.log(String(v));
        });

        if (withTolerance) {
            columnWidth
                .should("be.greaterThan", expectedWidth - AUTO_SIZE_TOLERANCE)
                .should("be.lessThan", expectedWidth + AUTO_SIZE_TOLERANCE);
        } else {
            columnWidth.should("equal", expectedWidth);
        }
    }
    scrollTo(position: positionType) {
        this.getElement().find(".ag-center-cols-viewport").scrollTo(position);
    }

    getMeasureCellHeader(cellIndex: number, index: number) {
        return this.getElement().find(
            `.s-table-measure-column-header-cell-${cellIndex}.s-table-measure-column-header-index-${index}`,
        );
    }

    getMeasureGroupCell(index: number) {
        return this.getElement().find(`.s-table-measure-column-header-group-cell-${index}`);
    }

    getPivotTableFooterCell(row: number, column: number) {
        return this.getElement()
            .find(".ag-floating-bottom")
            .find(".ag-floating-bottom-viewport")
            .find(`[row-index="b-${row}"]`)
            .find(`.s-cell-${row}-${column}`);
    }

    existPivotTableFooterRow(row: number, exist: boolean) {
        return this.getElement()
            .find(".ag-floating-bottom")
            .find(".ag-floating-bottom-viewport")
            .find(`[row-index="b-${row}"]`)
            .should(exist ? "exist" : "not.exist");
    }

    clickAggregationMenu(element: Cypress.Chainable<JQuery<HTMLElement>>) {
        element
            .trigger("mouseover")
            .wait(100)
            .find(".gd-menuOpenedByClick-togglerWrapped")
            .click({ force: true })
            .wait(300);

        cy.get(".s-menu-aggregation-inner").first().click();

        cy.wait(1000);
    }
}
