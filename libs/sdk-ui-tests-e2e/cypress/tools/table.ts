// (C) 2021 GoodData Corporation

const AUTO_SIZE_TOLERANCE = 10;
const RESIZE_SELECTOR = `.ag-header-cell-resize`;

export const nonEmptyValue = /\$?[0-9,.]+/;

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
        return this;
    }

    click(rowIndex: number, columnIndex: number) {
        this.waitLoaded();

        this.getElement()
            .find(`.gd-cell-drillable.s-cell-${rowIndex}-${columnIndex} .s-value`)
            .first()
            .should("exist");

        this.getElement()
            .find(`.gd-cell-drillable.s-cell-${rowIndex}-${columnIndex} .s-value`)
            .first()
            .click();
        return this;
    }

    getCell(rowIndex: number, columnIndex: number) {
        return this.getElement().find(".ag-body-viewport").find(`.s-cell-${rowIndex}-${columnIndex}`);
    }

    scrollIntoView() {
        this.getElement().scrollIntoView();
        return this;
    }

    hasCellWidth(rowIndex: number, columnIndex: number, expectedWidth: number, withTolerance = false) {
        const columnWidth = () => this.getCell(rowIndex, columnIndex).invoke("outerWidth");

        if (withTolerance) {
            columnWidth()
                .should("be.greaterThan", expectedWidth - AUTO_SIZE_TOLERANCE)
                .and("be.lessThan", expectedWidth + AUTO_SIZE_TOLERANCE);
        } else {
            columnWidth().should("equal", expectedWidth);
        }
    }

    scrollTo(position: Cypress.PositionType) {
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
        element.trigger("mouseover").find(".gd-menuOpenedByClick-togglerWrapped").click();

        cy.get(".s-menu-aggregation-inner").first().click();
    }

    aggregationSubMenuHasColumn(element: Cypress.Chainable<JQuery<HTMLElement>>, exist = false) {
        element.trigger("mouseover").find(".gd-menuOpenedByClick-togglerWrapped").click();

        cy.get(".s-menu-aggregation-inner").first().trigger("mouseover");

        cy.get(".gd-aggregation-submenu")
            .find(".s-menu-aggregation-inner-column")
            .should(exist ? "exist" : "not.exist");
    }

    getColumnValues(columnIndex: number) {
        this.waitLoaded();
        const result = [] as string[];
        this.getElement()
            .find(`.gd-column-index-${columnIndex} .s-value`)
            .each(($li) => {
                return result.push($li.text());
            });
        return cy.wrap(result);
    }

    getCellValue(row: number, column: number) {
        return this.getElement().find(`.s-cell-${row}-${column} .s-value`);
    }

    hasCellValue(row: number, column: number, value: string) {
        this.getCellValue(row, column).should("have.text", value);
        return this;
    }

    getResizeColumnAndGroupCell(groupIndex: number, columnIndex: number, isColumn: boolean) {
        if (isColumn) {
            return this.getElement().find(`.s-table-measure-column-header-index-${columnIndex}`);
        }
        return this.getElement().find(
            `.s-table-measure-column-header-group-cell-${groupIndex}.s-table-measure-column-header-index-${columnIndex}`,
        );
    }

    resizeColumn(
        groupIndex = 0,
        columnIndex = 0,
        destinationOffsetX = 0,
        isColumn: boolean,
        useMetaKey?: boolean,
    ) {
        const mouseDownProperties = useMetaKey ? { button: 0, ctrlKey: true } : { button: 0, force: true };
        this.getResizeColumnAndGroupCell(groupIndex, columnIndex, isColumn)
            .find(RESIZE_SELECTOR)
            .trigger("mousedown", mouseDownProperties)
            .trigger("mousemove", destinationOffsetX, 0, { force: true })
            .trigger("mouseup", { force: true });
        return this;
    }
}
