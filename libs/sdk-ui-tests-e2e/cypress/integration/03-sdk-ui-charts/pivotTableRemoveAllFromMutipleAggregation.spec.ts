// (C) 2022-2025 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

import { TotalTypes } from "../../tools/enum/TotalTypes";

describe("Pivot Table Aggregations remove all row totals", () => {
    beforeEach(() => {
        Navigation.visit("visualizations/pivot-table/pivot-table-all-total-aggregations-menu");
    });

    // TODO: fix this test
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip("should remove row totals for all measures", { tags: ["pre-merge_isolated_bear"] }, () => {
        const table = new Table(".s-pivot-table-aggregations-menu");
        table.waitLoaded();

        const element = table.getMeasureGroupCell(0).eq(0);
        table.addOrRemoveRowTotal(element, TotalTypes.SUM);

        table.waitRowColumnLoaded();

        table.existPivotTableFooterRow(0, false);
    });
});
