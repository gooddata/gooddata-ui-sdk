// (C) 2023-2026 GoodData Corporation

import { TotalTypes } from "../../tools/enum/TotalTypes";
import { visit } from "../../tools/navigation";
import { Table } from "../../tools/table";

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("Pivot Table Aggregations menu", { tags: ["checklist_integrated_bear"] }, () => {
    beforeEach(() => {
        visit("visualizations/pivot-table/pivot-table-columns-aggregations-menu-one-subtotal-scenario");
    });

    it("should apply column total correctly and render insight without errors", () => {
        const table = new Table(".gd-table-component");
        table.waitLoaded();

        const element = table.getMeasureCellHeader(0, 2);

        table.openAggregationMenu(element, TotalTypes.SUM);
        table.assertColumnTotal("within Forecast Category", true);

        table.hasCellValue(0, 6, "$8,091,764.99");
    });
});
