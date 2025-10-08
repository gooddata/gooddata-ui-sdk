// (C) 2021-2025 GoodData Corporation

// NOTE: Backward-compatible rewrite of the legacy Table test helper
// to work with the new Pivot Table Next DOM (aria roles/indices and new classes).
// Keep the public API so existing tests do not need call-site changes.

import { TotalTypes } from "./enum/TotalTypes";

const AUTO_SIZE_TOLERANCE = 10; // kept for backward compat where used
const COLUMN_WIDTH_TOLERANCE = 12; // aligns with PT Next width variance

// New DOM bits
const PT_CONTAINER = ".gd-pivot-table-next";
const PT_HEADER_CELL = ".gd-pivot-table-next__header-cell";
const PT_CELL = ".gd-pivot-table-next__cell";
const PT_CELL_DRILLABLE = ".gd-pivot-table-next__cell--drillable";
const PT_HEADER_MENU_BTN = ".gd-pivot-table-next__header-cell-menu-button";
const TABLE_TOTAL_OF_TOTALS = ".s-table-row-total-column-total"; // unchanged semantic s-classes
const LOADING_COMPUTING = ".adi-computing-inner"; // computing overlay

/** utility: convert 0-based column index to aria-colindex (1-based) */
const colAria = (index: number) => index + 1;

/**
 * Legacy helper, updated to Pivot Table Next DOM.
 * Most methods are preserved; where a 1:1 mapping is not possible,
 * we keep the method and emulate a close behavior using the new DOM.
 */
export class Table {
    constructor(private parentSelector: string) {}

    private headerRowSelector(rowindex: number) {
        return rowindex > 0
            ? `.ag-header-row[aria-rowindex="${rowindex}"]`
            : `.ag-header-row.ag-header-row-column`;
    }

    getElement(): Cypress.Chainable {
        return cy.get(this.parentSelector).find(PT_CONTAINER);
    }

    /**
     * In legacy it asserted the table did not exist. Kept behavior.
     */
    public isEmpty() {
        this.getElement().should("not.exist");
        return this;
    }

    /**
     * Old spinner changed; use ag overlay/computing signal to detect start.
     */
    public waitLoadStarted() {
        // Either the ag overlay shows or the computing overlay appears
        this.getElement().find(".ag-overlay-loading-wrapper:visible").should("exist");
        return this;
    }

    /**
     * Legacy isLoaded(): assert not loading + header present
     */
    public isLoaded(): this {
        this.waitLoaded();
        // sanity: ensure we have at least one header cell rendered
        this.getElement()
            .find(`.ag-header ${PT_HEADER_CELL}, .ag-header [role="columnheader"]`)
            .should("exist");
        return this;
    }

    /** Wait until rows are rendered & no loading overlays remain. */
    public waitLoaded(): this {
        this.getElement().find(".ag-overlay-loading-wrapper:visible").should("not.exist");
        this.getElement().find('[aria-label="Row data is loading"]', { timeout: 30000 }).should("not.exist");
        this.getElement().find(".ag-center-cols-viewport .ag-row").should("exist");
        return this;
    }

    /** Backward name kept; same as waitLoaded with PT Next. */
    public waitRowColumnLoaded(): this {
        return this.waitLoaded();
    }

    click(rowIndex: number, columnIndex: number, waitForLoad = true) {
        if (waitForLoad) this.waitLoaded();

        this.getElement()
            .find(
                `[role="row"][row-index="${rowIndex}"] [role="gridcell"][aria-colindex="${colAria(
                    columnIndex,
                )}"]${PT_CELL}.ag-cell-value`,
            )
            .first()
            .should("exist")
            .click({ force: true });
        return this;
    }

    getCell(rowIndex: number, columnIndex: number) {
        return this.getElement().find(
            `[role="row"][row-index="${rowIndex}"] [role="gridcell"][aria-colindex="${colAria(columnIndex)}"]`,
        );
    }

    scrollIntoView() {
        this.getElement().scrollIntoView();
        return this;
    }

    hasCellWidth(rowIndex: number, columnIndex: number, expectedWidth: number, withTolerance = false) {
        // Header width is the stable reference in PT Next; align to header row 4 (leaf headers)
        const width = this.getElement()
            .find(
                `.ag-header-row[aria-rowindex="4"] [role="columnheader"][aria-colindex="${colAria(
                    columnIndex,
                )}"]`,
            )
            .invoke("width");

        if (withTolerance) {
            width
                .should("be.greaterThan", expectedWidth - AUTO_SIZE_TOLERANCE)
                .and("be.lessThan", expectedWidth + AUTO_SIZE_TOLERANCE);
        } else {
            width.should("be.closeTo", expectedWidth, COLUMN_WIDTH_TOLERANCE);
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
        // Map to header cell by aria indices; PT Next composes labels inside .gd-header-text
        return this.getElement().find(
            `.ag-header [role="row"][aria-rowindex="${index}"] [role="columnheader"][aria-colindex="${colAria(
                cellIndex,
            )}"] .gd-header-text`,
        );
    }

    getMeasureGroupCell(index: number) {
        return this.getElement().find(
            `.ag-header-row[aria-rowindex="1"] [aria-colindex="${colAria(index)}"]`,
        );
    }

    getPivotTableFooterCell(row: number, column: number) {
        return this.getElement()
            .find(".ag-floating-bottom .ag-floating-bottom-viewport")
            .find(`[row-index="b-${row}"] [role="gridcell"][aria-colindex="${colAria(column)}"]`);
    }

    existPivotTableColumnTotalCell(row: number, column: number, exist: boolean) {
        this.getElement()
            .find(
                `.ag-center-cols-viewport [role="row"][row-index="${row}"] [role="gridcell"][aria-colindex="${colAria(
                    column,
                )}"] .s-total`,
            )
            .should(exist ? "exist" : "not.exist");

        return this;
    }

    existPivotTableFooterRow(row: number, exist: boolean) {
        return this.getElement()
            .find(".ag-floating-bottom .ag-floating-bottom-viewport")
            .find(`[row-index="b-${row}"]`)
            .should(exist ? "exist" : "not.exist");
    }

    existPivotTableColumnTotal(headerPosition: number, exist: boolean) {
        this.getElement()
            .find(`.ag-header .ag-header-viewport .gd-column-total.gd-column-group-header-${headerPosition}`)
            .should(exist ? "exist" : "not.exist");

        return this;
    }

    private openAggMenu(element: Cypress.Chainable<JQuery<HTMLElement>>) {
        element.trigger("mouseover").find(PT_HEADER_MENU_BTN).click({ force: true });
    }

    clickAggregationMenu(element: Cypress.Chainable<JQuery<HTMLElement>>, aggregationItem: TotalTypes) {
        this.openAggMenu(element);
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
        this.openAggMenu(element);
        cy.get(".s-menu-aggregation-inner").first().trigger("mouseover");
        cy.get(".gd-aggregation-submenu")
            .find(".s-menu-aggregation-inner-column")
            .should(exist ? "exist" : "not.exist");
    }

    getColumnValues(columnIndex: number) {
        this.waitLoaded();
        const result: string[] = [];
        this.getElement()
            .find(
                `.ag-center-cols-viewport [role="gridcell"][aria-colindex="${colAria(columnIndex)}"].ag-cell-value`,
            )
            .each(($el) => result.push($el.text().trim()));
        return cy.wrap(result);
    }

    getRowValues(rowIndex: number) {
        this.waitLoaded();
        const result: string[] = [];
        this.getElement()
            .find(`[role="row"][row-index="${rowIndex}"] ${PT_CELL}.ag-cell-value`)
            .each(($el) => result.push($el.text().trim()));
        return cy.wrap(result);
    }

    getCellValue(row: number, column: number) {
        this.waitLoaded();
        return this.getElement().find(
            `[role="row"][row-index="${row}"] [role="gridcell"][aria-colindex="${colAria(column)}"] ${PT_CELL}.ag-cell-value`,
        );
    }

    hasCellValue(row: number, column: number, value: string) {
        this.getCellValue(row, column).should(($el) => {
            // eslint-disable-next-line jest/valid-expect
            expect(($el.text() || "").trim()).to.eq(value);
        });
        return this;
    }

    getResizeColumnAndGroupCell(groupIndex: number, columnIndex: number, isColumn: boolean) {
        // In PT Next resizing is done from the header leaf row (aria-rowindex 4)

        const rowIndex = isColumn ? 4 : groupIndex;
        return this.getElement().find(
            `.ag-header-row[aria-rowindex="${rowIndex}"] [role="columnheader"][aria-colindex="${colAria(
                columnIndex,
            )}"]`,
        );
    }

    resizeColumn(
        groupIndex = 0,
        columnIndex = 0,
        destinationOffsetX = 0,
        isColumn: boolean,
        useMetaKey?: boolean,
    ) {
        const mouseDownProperties = useMetaKey
            ? { button: 0, ctrlKey: true }
            : ({ button: 0, force: true } as const);
        this.getResizeColumnAndGroupCell(groupIndex, columnIndex, isColumn)
            .find(".ag-header-cell-resize")
            .trigger("mousedown", mouseDownProperties)
            .trigger("mousemove", destinationOffsetX, 0, { force: true })
            .trigger("mouseup", { force: true });
        return this;
    }

    assertShortenMetricName(width: number) {
        // PT Next keeps header label in .gd-header-text; CSS ellipsis still applies to inner span
        this.getElement()
            .find(`.s-header-cell-label span`)
            .invoke("css", "text-overflow")
            .should("equal", "ellipsis");
        this.getElement().find(`.s-header-cell-label span`).invoke("width").should("equal", width);
        return this;
    }

    hasHeaderColumnWidth(width: number) {
        this.getElement()
            .find(`.s-header-cell-label span`)
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
            .find(
                `.ag-header [role="row"][aria-rowindex="${rowIndex}"] [role="columnheader"][aria-colindex="${colAria(
                    columnIndex,
                )}"] .s-header-cell-label`,
            )
            .should("have.text", metricName);
        return this;
    }

    hasColumnHeaderOnTop(columnHeaders: string) {
        this.getElement().find(`.s-table-column-group-header-descriptor`).should("have.text", columnHeaders);
        return this;
    }

    hasHeader(columnHeaders: string) {
        this.getElement()
            .find(`.gd-column-group-header--first .gd-pivot-table-header-label--clickable`)
            .should("have.text", columnHeaders);
        return this;
    }

    hasMeasureHeader(index: number, content: string, exist = false) {
        const el = this.getElement().find(
            `.ag-header-row[aria-rowindex="3"] [role="columnheader"][aria-colindex="${colAria(index)}"] .gd-header-text`,
        );
        el.should(exist ? "exist" : "not.exist");
        if (exist) el.contains(content);
        return this;
    }

    // ---------- Extra helpers mirrored from new API where handy ----------

    hasAggregationMenu(_row: number, column: number, expect: boolean) {
        const header = this.getElement().find(
            `.ag-header-row[aria-rowindex="3"] [role="columnheader"][aria-colindex="${colAria(column)}"]`,
        );
        header.trigger("mouseover");
        header.find(PT_HEADER_MENU_BTN).should(expect ? "exist" : "not.exist");
        return this;
    }

    hasTotalOfTotals(exist: boolean) {
        cy.get(TABLE_TOTAL_OF_TOTALS).should(exist ? "exist" : "not.exist");
        return this;
    }

    hasMarginalTotals(rowType: string, columnType: string, exist: boolean) {
        cy.get(`.s-table-row-${rowType}-column-${columnType}`).should(exist ? "exist" : "not.exist");
        return this;
    }

    waitDrillable() {
        // Expect at least one drillable cell
        this.getElement().find(PT_CELL_DRILLABLE).should("be.visible");
        return this;
    }

    clickDrill(rowIndex: number, columnIndex: number) {
        this.waitLoaded();
        this.waitDrillable();
        this.getElement()
            .find(
                `[role="row"][row-index="${rowIndex}"] [role="gridcell"][aria-colindex="${colAria(
                    columnIndex,
                )}"]${PT_CELL_DRILLABLE}.ag-cell-value`,
            )
            .first()
            .click({ force: true });
        return this;
    }

    notHasDrillCell(rowIndex: number, columnIndex: number) {
        this.waitLoaded();
        this.getElement()
            .find(
                `[role="row"][row-index="${rowIndex}"] [role="gridcell"][aria-colindex="${colAria(
                    columnIndex,
                )}"]`,
            )
            .first()
            .should("not.have.class", PT_CELL_DRILLABLE.replace(".", ""));
        return this;
    }

    isComputed() {
        cy.get(LOADING_COMPUTING).should("not.exist");
        this.getElement().should("exist");
        return this;
    }

    getColumnGroupHeaderByRowIndex(rowIndex: number) {
        this.waitLoaded();
        const headers: string[] = [];
        this.getElement()
            .find(`.ag-header-row[aria-rowindex="${rowIndex}"] .gd-header-text`)
            .each(($li) => headers.push($li.text().trim()));
        return cy.wrap(headers);
    }

    getCellValuesByColumn(column: number) {
        this.waitLoaded();
        const result: string[] = [];
        this.getElement()
            .find(
                `.ag-center-cols-viewport [role="gridcell"][aria-colindex="${colAria(column)}"] .ag-cell-value`,
            )
            .each(($li) => result.push($li.text().trim()));
        return cy.wrap(result);
    }
}
