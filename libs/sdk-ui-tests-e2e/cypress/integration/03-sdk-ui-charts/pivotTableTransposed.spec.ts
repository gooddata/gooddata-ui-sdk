// (C) 2023-2025 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { TableNew } from "../../tools/tableNew";

describe(
    "Table Component",
    { tags: ["checklist_integrated_tiger_be", "checklist_integrated_tiger_fe"] },
    () => {
        const table = new TableNew(".s-table-component-transpose");

        it(
            "should display Metric in row, Column header on top",
            { tags: ["checklist_integrated_tiger_releng_be"] },
            () => {
                Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-mr-row-top");
                table
                    .waitLoaded()
                    .hasMetricHeaderInRow(1, 1, "Amount")
                    .hasMetricHeaderInRow(2, 1, "Amount")
                    .hasColumnHeader(0, ["Product"]);
            },
        );

        it(
            "should display Row attribute and Column header on top",
            { tags: ["checklist_integrated_tiger_releng_be", "checklist_integrated_tiger_releng_fe"] },
            () => {
                Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-rc-row-top");
                table.waitLoaded().hasColumnHeader(0, ["Product"]).hasColumnHeaderOnTop("Forecast Category");
            },
        );

        it("should display Row header on top", () => {
            Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-r-row-top");
            table.waitLoaded().hasColumnHeader(0, ["Product"]);
        });

        it("should display Metric in row", () => {
            Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-m-row-top");
            table.waitLoaded().hasMetricHeaderInRow(0, 0, "Amount").hasCellValue(0, 1, "$116,625,456.54");
        });

        it("should display Column header on top", () => {
            Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-c-left");
            table.isLoaded().hasColumnHeaderOnTop("Forecast Category");
        });
    },
);

describe("Insight View", { tags: ["checklist_integrated_tiger_be", "checklist_integrated_tiger_fe"] }, () => {
    const table = new TableNew(".s-insight-view-transpose");

    // TODO: skip this because of bug https://gooddata.atlassian.net/browse/F1-2003
    it.skip("should display Metric in row, Column header on left", () => {
        Navigation.visit("insight/insight-transpose-has-mc-row-left");
        table.waitLoaded().hasCellValue(0, 0, "Forecast Category").hasMetricHeaderInRow(1, 0, "Amount");
    });

    it("should display Metric in column, Column header on the top", () => {
        Navigation.visit("insight/insight-transpose-has-mc-column-top");
        table
            .waitLoaded()
            .hasColumnHeader(0, ["Forecast Category", "Exclude", "Amount"])
            .hasColumnHeader(1, ["Include", "Amount"]);
    });

    it("should display Metric in row", () => {
        Navigation.visit("insight/insight-transpose-has-mc-row");
        table.waitLoaded().hasMetricHeaderInRow(0, 0, "Amount");
    });

    // TODO: skip this because of bug https://gooddata.atlassian.net/browse/F1-2003
    it.skip("should display Column header on top", () => {
        Navigation.visit("insight/insight-transpose-has-mc-left");
        table.waitLoaded().hasColumnHeaderOnTop("Forecast Category");
    });
});
