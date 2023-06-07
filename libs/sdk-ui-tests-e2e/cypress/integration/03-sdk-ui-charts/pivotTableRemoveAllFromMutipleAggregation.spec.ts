// (C) 2022 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

import { TotalTypes } from "../../tools/enum/TotalTypes";

describe("Pivot Table Aggregations remove all row totals", () => {
    beforeEach(() => {
        Navigation.visit("visualizations/pivot-table/pivot-table-all-total-aggregations-menu");
    });

    it("should remove row totals for all measures", { tags: ["pre-merge_isolated_bear"] }, () => {
        const table = new Table(".s-pivot-table-aggregations-menu");
        table.waitLoaded();

        const element = table.getMeasureGroupCell(0).eq(0);
        table.addOrRemoveRowTotal(element, TotalTypes.SUM);

        table.waitRowColumnLoaded();

        table.existPivotTableFooterRow(0, false);
    });
});

describe("Pivot Table Aggregations remove all column totals", () => {
    beforeEach(() => {
        Navigation.visit("visualizations/pivot-table/pivot-table-column-all-total-aggregations-menu");
    });

    it("should remove column totals for all measures", { tags: ["pre-merge_isolated_bear"] }, () => {
        const table = new Table(".s-pivot-table-aggregations-menu");
        table.waitLoaded();

        const element = table.getMeasureGroupCell(0).eq(0);
        table.addOrRemoveColumnTotal(element, TotalTypes.SUM);

        table.waitRowColumnLoaded();

        table.existPivotTableColumnTotal(1, false);
    });
});
