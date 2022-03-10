// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { nonEmptyValue, Table } from "../../tools/table";

describe("Pivot Table Aggregations remove all totals", () => {
    beforeEach(() => {
        cy.login();
        Navigation.visit("visualizations/pivot-table/pivot-table-all-total-aggregations-menu");
    });

    it("should remove totals for one measure and one keep the other total (SEPARATE)", () => {
        const table = new Table(".s-pivot-table-aggregations-menu");
        table.waitLoaded();

        const element1 = table.getMeasureCellHeader(0, 2);
        table.clickAggregationMenu(element1);

        table.waitRowLoaded();
        cy.wait(300);

        table.getPivotTableFooterCell(0, 0).find(`.s-value`).should("have.text", "Sum");

        table
            .getPivotTableFooterCell(0, 2)
            .find(`.s-value`)
            .invoke("text")
            .then((text) => {
                expect(text).not.match(nonEmptyValue);
            });

        table
            .getPivotTableFooterCell(0, 3)
            .find(`.s-value`)
            .invoke("text")
            .then((text) => {
                expect(text).match(nonEmptyValue);
            });
    });
});
