// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

describe("Pivot Table Aggregations remove one totals", () => {
    beforeEach(() => {
        cy.login();
        Navigation.visit("visualizations/pivot-table/pivot-table-one-total-aggregations-menu");
    });

    // this test is running well on live backend but on recorded backend it failed
    // table not get correct response after total removed

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip("should remove totals for one measure (SEPARATE)", () => {
        const table = new Table(".s-pivot-table-aggregations-menu");
        table.waitLoaded();

        const element = table.getMeasureCellHeader(0, 2);
        table.clickAggregationMenu(element);

        table.waitRowLoaded();
        cy.wait(300);

        table.existPivotTableFooterRow(0, false);
    });
});
