// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";
import { TotalTypes } from "../../tools/enum/TotalTypes";

describe("Pivot Table Aggregations remove one row totals", () => {
    beforeEach(() => {
        Navigation.visit("visualizations/pivot-table/pivot-table-one-total-aggregations-menu");
    });

    it("should remove row totals for one measure (SEPARATE)", { tags: ["pre-merge_isolated_bear"] }, () => {
        const table = new Table(".s-pivot-table-aggregations-menu");
        table.waitLoaded();

        const element = table.getMeasureCellHeader(0, 2);
        table.addOrRemoveRowTotal(element, TotalTypes.SUM);

        table.waitRowColumnLoaded();

        table.existPivotTableFooterRow(0, false);
    });
});

describe("Pivot Table Aggregations remove one column totals", () => {
    beforeEach(() => {
        Navigation.visit("visualizations/pivot-table/pivot-table-one-total-column-aggregations-menu");
    });

    it(
        "should remove column totals for one measure (SEPARATE)",
        { tags: ["pre-merge_isolated_bear"] },
        () => {
            const table = new Table(".s-pivot-table-aggregations-menu");
            table.waitLoaded();

            const element = table.getMeasureCellHeader(0, 2);
            table.addOrRemoveColumnTotal(element, TotalTypes.SUM);

            table.waitRowColumnLoaded();

            table.existPivotTableColumnTotal(1, false);
        },
    );
});
