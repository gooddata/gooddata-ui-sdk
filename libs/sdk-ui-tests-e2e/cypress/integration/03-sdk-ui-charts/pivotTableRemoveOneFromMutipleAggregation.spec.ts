// (C) 2022-2023 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { nonEmptyValue, Table } from "../../tools/table";

import { TotalTypes } from "../../tools/enum/TotalTypes";

describe("Pivot Table Aggregations remove all row totals", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("visualizations/pivot-table/pivot-table-all-total-aggregations-menu");
    });

    it("should remove row totals for one measure and one keep the other total (SEPARATE)", () => {
        const table = new Table(".s-pivot-table-aggregations-menu");
        table.waitLoaded();

        const element1 = table.getMeasureCellHeader(0, 2);
        table.addOrRemoveRowTotal(element1, TotalTypes.SUM);

        table.waitRowColumnLoaded();

        table.getPivotTableFooterCell(0, 0).find(`.s-value`).should("have.text", "Sum");

        table
            .waitLoaded()
            .getPivotTableFooterCell(0, 2)
            .find(`.s-value`)
            .invoke("text")
            .then((text) => {
                expect(text).not.match(nonEmptyValue);
            });

        table
            .waitLoaded()
            .getPivotTableFooterCell(0, 3)
            .find(`.s-value`)
            .invoke("text")
            .then((text) => {
                expect(text).match(nonEmptyValue);
            });
    });
});

describe("Pivot Table Aggregations remove all column totals", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("visualizations/pivot-table/pivot-table-column-all-total-aggregations-menu");
    });

    it("should remove column totals for one measure and one keep the other total (SEPARATE)", () => {
        const table = new Table(".s-pivot-table-aggregations-menu");
        table.waitLoaded();

        const element1 = table.getMeasureCellHeader(0, 2);
        table.addOrRemoveColumnTotal(element1, TotalTypes.SUM);

        table.waitRowColumnLoaded();

        table.existPivotTableColumnTotal(2, false);

        table.existPivotTableColumnTotalCell(0, 10, false);
    });
});
