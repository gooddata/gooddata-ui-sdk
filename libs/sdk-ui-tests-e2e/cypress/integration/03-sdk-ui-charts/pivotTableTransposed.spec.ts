// (C) 2023-2025 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

describe("Table Component", { tags: ["checklist_integrated_tiger"] }, () => {
    const table = new Table(".s-table-component-transpose");

    it(
        "should display Metric in row, Column header on top",
        { tags: ["checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-mr-row-left");
            table
                .waitLoaded()
                .hasMetricHeaderInRow(1, 1, "Amount")
                .hasMetricHeaderInRow(2, 1, "Amount")
                .hasHeader("Product");
        },
    );

    it("should display successful with Metric in row", () => {
        Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-mr-row-top");
        table.waitLoaded().hasMetricHeaderInRow(1, 1, "Amount").hasMetricHeaderInRow(2, 1, "Amount");
    });

    it(
        "should display Row attribute and Column header on top",
        { tags: ["checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-rc-row-left");
            table.waitLoaded().hasHeader("Product").hasColumnHeaderOnTop("Forecast Category");
        },
    );

    it("should display Row header on top", () => {
        Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-r-row-left");
        table.waitLoaded().hasHeader("Product");
    });

    it("should display Metric in row", () => {
        Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-m-row-left");
        table.waitLoaded().hasMetricHeaderInRow(0, 0, "Amount").hasCellValue(0, 1, "$116,625,456.54");
    });

    it("should display Column header on top", () => {
        Navigation.visit("visualizations/pivot-table/pivot-table-transposed-has-c-left");
        table.isLoaded().hasColumnHeaderOnTop("Forecast Category");
    });
});

describe("Insight View", { tags: ["checklist_integrated_tiger"] }, () => {
    const table = new Table(".s-insight-view-transpose");

    it("should display Metric in row, Column header on left", () => {
        Navigation.visit("insight/insight-transpose-has-mc-row-left");
        table.waitLoaded().hasCellValue(0, 0, "Forecast Category").hasMetricHeaderInRow(1, 0, "Amount");
    });

    it("should display Metric in column, Column header on top", () => {
        Navigation.visit("insight/insight-transpose-has-mc-column-left");
        table
            .waitLoaded()
            .hasColumnHeaderOnTop("Forecast Category")
            .hasMeasureHeader(1, "Amount", true)
            .hasMeasureHeader(2, "Amount", true);
    });

    it("should display Metric in column, Column header on the top", () => {
        Navigation.visit("insight/insight-transpose-has-mc-column-top");
        table
            .waitLoaded()
            .hasColumnHeaderOnTop("Forecast Category")
            .hasMeasureHeader(0, "Amount", true)
            .hasMeasureHeader(1, "Amount", true);
    });

    it("should display Metric in row", () => {
        Navigation.visit("insight/insight-transpose-has-mc-row");
        table.waitLoaded().hasMetricHeaderInRow(0, 0, "Amount");
    });

    it("should display Column header on top", () => {
        Navigation.visit("insight/insight-transpose-has-mc-left");
        table.waitLoaded().hasColumnHeaderOnTop("Forecast Category");
    });
});
