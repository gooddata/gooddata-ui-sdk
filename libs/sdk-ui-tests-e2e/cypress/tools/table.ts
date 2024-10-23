// (C) 2021-2024 GoodData Corporation

import { TotalTypes } from "./enum/TotalTypes";

const AUTO_SIZE_TOLERANCE = 10;
const RESIZE_SELECTOR = `.ag-header-cell-resize`;

export const nonEmptyValue = /\$?[0-9,.]+/;

export class Table {
    constructor(private parentSelector: string) {}

    getElement(): Cypress.Chainable {
        return cy.get(this.parentSelector).find(".s-pivot-table");
    }

    public isEmpty() {
        this.getElement().should("not.exist");
        return this;
    }

    public waitLoadStarted() {
        this.getElement().find(".s-loading").should("exist");
        return this;
    }

    public waitLoaded(): this {
        this.getElement().find(".s-loading").should("not.exist");
        this.getElement().find(".s-loading-done").should("exist");
        return this;
    }

    public waitRowColumnLoaded(): this {
        this.getElement().find(".s-loading").should("not.exist");
        return this;
    }

    click(rowIndex: number, columnIndex: number, waitForLoad = true) {
        if (waitForLoad) {
            this.waitLoaded();
        }

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
        return this;
    }

    scrollTo(position: Cypress.PositionType) {
        this.getElement().find(".ag-center-cols-viewport").scrollTo(position, { ensureScrollable: true });
        return this;
    }

    scrollVerticalTo(position: Cypress.PositionType) {
        this.getElement().find(".ag-body-viewport").scrollTo(position, { ensureScrollable: true });
        return this;
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

    existPivotTableColumnTotalCell(row: number, column: number, exist: boolean) {
        this.getElement()
            .find(".ag-body-viewport")
            .find(`.gd-total-column.s-cell-${row}-${column}`)
            .should(exist ? "exist" : "not.exist");

        return this;
    }

    existPivotTableFooterRow(row: number, exist: boolean) {
        return this.getElement()
            .find(".ag-floating-bottom")
            .find(".ag-floating-bottom-viewport")
            .find(`[row-index="b-${row}"]`)
            .should(exist ? "exist" : "not.exist");
    }

    existPivotTableColumnTotal(headerPosition: number, exist: boolean) {
        this.getElement()
            .find(".ag-header")
            .find(".ag-header-viewport")
            .find(`.gd-column-total.gd-column-group-header-${headerPosition}`)
            .should(exist ? "exist" : "not.exist");

        return this;
    }

    clickAggregationMenu(element: Cypress.Chainable<JQuery<HTMLElement>>, aggregationItem: TotalTypes) {
        element.trigger("mouseover").find(".gd-menuOpenedByClick-togglerWrapped").click();

        cy.get(".s-menu-aggregation-inner").contains(aggregationItem).trigger("mouseover");
    }

    addOrRemoveRowTotal(element: Cypress.Chainable<JQuery<HTMLElement>>, aggregationItem: TotalTypes) {
        this.clickAggregationMenu(element, aggregationItem);
        cy.get(".s-menu-aggregation-inner").contains("of all rows").click();
        return this;
    }

    addOrRemoveColumnTotal(element: Cypress.Chainable<JQuery<HTMLElement>>, aggregationItem: TotalTypes) {
        this.clickAggregationMenu(element, aggregationItem);
        cy.get(".s-menu-aggregation-inner").contains("of all columns").click();
        return this;
    }

    openAggregationMenu(element: Cypress.Chainable<JQuery<HTMLElement>>, aggregationItem: TotalTypes) {
        this.clickAggregationMenu(element, aggregationItem);
        return this;
    }

    assertColumnTotal(expectItem: string, isChecked = false) {
        cy.get(".s-menu-aggregation-inner")
            .parent(isChecked ? ".is-checked" : ".gd-menu-item")
            .should("exist")
            .should("contain", expectItem);
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
                result.push($li.text());
            });
        return cy.wrap(result);
    }

    getRowValues(rowIndex: number) {
        this.waitLoaded();
        const result = [] as string[];
        this.getElement()
            .find(`[row-index="${rowIndex}"] .s-value`)
            .each(($li) => {
                result.push($li.text());
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

    assertShortenMetricName(width: number) {
        cy.get(".s-header-cell-label span").invoke("css", "text-overflow").should("equal", "ellipsis");
        cy.get(".s-header-cell-label span").invoke("width").should("equal", width);
        return this;
    }

    hasHeaderColumnWidth(width: number) {
        cy.get(".s-header-cell-label span")
            .invoke("width")
            .should("be.gte", width)
            .should("be.lte", width + 2);
        return this;
    }

    isCellUnderlined(cellName: string, isUnderlined = true) {
        cy.get(`.s-header-cell-label.gd-pivot-table-header-label`)
            .contains(cellName)
            .trigger("mouseover")
            .should(isUnderlined ? "have.css" : "not.have.css", "text-decoration", "underline");
    }

    hasMetricHeaderInRow(rowIndex: number, columnIndex: number, metricName: string) {
        this.getElement()
            .find(`.s-cell-${rowIndex}-${columnIndex} .s-header-cell-label`)
            .should("have.text", metricName);
        return this;
    }

    hasColumnHeaderOnTop(columnHeaders: string) {
        this.getElement().find(".s-table-column-group-header-descriptor").should("have.text", columnHeaders);
        return this;
    }

    hasHeader(columnHeaders: string) {
        this.getElement()
            .find(".gd-column-group-header--first .gd-pivot-table-header-label--clickable")
            .should("have.text", columnHeaders);
        return this;
    }

    hasMeasureHeader(index: number, content: string, exist = false) {
        this.getElement()
            .find(`.s-table-measure-column-header-index-${index}`)
            .should(exist ? "exist" : "not.exist")
            .contains(content);
        return this;
    }
}
