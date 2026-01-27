// (C) 2022-2026 GoodData Corporation

import { TotalTypes } from "../../tools/enum/TotalTypes";
import { visit } from "../../tools/navigation";
import { Table, nonEmptyValue } from "../../tools/table";

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip(
    "Pivot Table Aggregations menu and add row totals",
    { tags: ["pre-merge_isolated_bear"] },
    () => {
        beforeEach(() => {
            visit("visualizations/pivot-table/pivot-table-aggregations-menu");
        });

        it("hovering over menu does not show sorting icon (SEPARATE)", () => {
            const table = new Table(".s-pivot-table-aggregations-menu");
            table.waitLoaded();

            //check exist sort icon
            table.getMeasureCellHeader(0, 2).realHover().find(".s-sort-direction-arrow").should("exist");

            //check exist menu
            table
                .getMeasureCellHeader(0, 2)
                .realHover()
                .find(".s-table-header-menu")
                .should("exist")
                .should("have.class", "gd-pivot-table-header-menu--show");

            //do menu hover
            table.getMeasureCellHeader(0, 2).realHover().find(".s-table-header-menu").realHover();

            //check exist sort icon
            table.getMeasureCellHeader(0, 2).find(".s-sort-direction-arrow").should("not.exist");

            //check exist sort icon
            table
                .getMeasureCellHeader(0, 2)
                .find(".s-table-header-menu")
                .should("exist")
                .should("have.class", "gd-pivot-table-header-menu--show");
        });

        it("should show menu toggler button when mouse hovers over the cell (SEPARATE)", () => {
            const table = new Table(".s-pivot-table-aggregations-menu");
            table.waitLoaded();

            // get first menu
            table
                .getMeasureCellHeader(0, 2)
                .realHover()
                .find(".s-table-header-menu")
                .should("exist")
                .should("have.class", "gd-pivot-table-header-menu--show");

            // get second menu
            table
                .getMeasureGroupCell(0)
                .eq(1)
                .realHover()
                .find(".s-table-header-menu")
                .should("exist")
                .should("have.class", "gd-pivot-table-header-menu--show");

            //check is first menu is hidden
            table
                .getMeasureCellHeader(0, 2)
                .first()
                .find(".s-table-header-menu")
                .should("exist")
                .should("have.class", "gd-pivot-table-header-menu--hide");
        });

        it("should add row totals for one measure (SEPARATE)", () => {
            const table = new Table(".s-pivot-table-aggregations-menu");
            table.waitLoaded();

            const element = table.getMeasureCellHeader(0, 2);
            table.addOrRemoveRowTotal(element, TotalTypes.SUM);

            table.waitRowColumnLoaded();

            table
                .getPivotTableFooterCell(0, 0)
                .find(`.s-value`)
                .then(function ($elem) {
                    cy.wrap($elem.text()).should("equal", "Sum");
                });

            table
                .getPivotTableFooterCell(0, 2)
                .find(`.s-value`)
                .then(function ($elem) {
                    cy.wrap($elem.text()).should("match", nonEmptyValue);
                });

            table
                .getPivotTableFooterCell(0, 3)
                .find(`.s-value`)
                .then(function ($elem) {
                    cy.wrap($elem.text()).should("not.match", nonEmptyValue);
                });

            table.existPivotTableFooterRow(1, false);
        });

        it("should add row totals for all measures (SEPARATE)", () => {
            const table = new Table(".s-pivot-table-aggregations-menu");
            table.waitLoaded();

            const element = table.getMeasureGroupCell(0).eq(0);
            table.addOrRemoveRowTotal(element, TotalTypes.SUM);

            table.waitRowColumnLoaded();

            table.getPivotTableFooterCell(0, 0).find(`.s-value`).should("have.text", "Sum");

            table
                .getPivotTableFooterCell(0, 2)
                .find(`.s-value`)
                .invoke("text")
                .then((text) => {
                    expect(text).match(nonEmptyValue);
                });

            table
                .getPivotTableFooterCell(0, 3)
                .find(`.s-value`)
                .invoke("text")
                .then((text) => {
                    expect(text).match(nonEmptyValue);
                });
        });

        it("should add row totals for group (SEPARATE)", () => {
            const table = new Table(".s-pivot-table-aggregations-menu");
            table.waitLoaded();

            const element = table.getMeasureGroupCell(0).eq(0);
            table.addOrRemoveRowTotal(element, TotalTypes.SUM);

            table.waitRowColumnLoaded();

            table.getPivotTableFooterCell(0, 0).find(`.s-value`).should("have.text", "Sum");

            table
                .getPivotTableFooterCell(0, 2)
                .find(`.s-value`)
                .invoke("text")
                .then((text) => {
                    expect(text).match(nonEmptyValue);
                });

            table
                .getPivotTableFooterCell(0, 3)
                .find(`.s-value`)
                .invoke("text")
                .then((text) => {
                    expect(text).match(nonEmptyValue);
                });
        });
    },
);

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("Pivot Table Column Aggregations menu", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        visit("visualizations/pivot-table/pivot-table-column-aggregations-menu");
    });

    it("should show aggregation sub menu for columns", () => {
        const table = new Table(".s-pivot-table-aggregations-menu");
        table.waitLoaded();

        const element = table.getMeasureGroupCell(0).eq(0);
        table.aggregationSubMenuHasColumn(element, true);
    });
});
