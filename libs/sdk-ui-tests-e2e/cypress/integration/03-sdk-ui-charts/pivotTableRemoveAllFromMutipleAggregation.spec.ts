// (C) 2022-2026 GoodData Corporation

import { TotalTypes } from "../../tools/enum/TotalTypes";
import { visit } from "../../tools/navigation";
import { Table } from "../../tools/table";

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("Pivot Table Aggregations remove all row totals", () => {
    beforeEach(() => {
        visit("visualizations/pivot-table/pivot-table-all-total-aggregations-menu");
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
