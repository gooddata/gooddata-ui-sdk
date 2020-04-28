// (C) 2007-2019 GoodData Corporation
// TODO BB-1694 - Uncomment this test
// import { Selector } from "testcafe";
// import { loginUsingLoginForm, waitForPivotTableStopLoading, checkCellValue, checkRenderChart } from "./utils/helpers";
// import config from "./utils/config";

// const CELL_0_0 = ".s-cell-0-0";
// const CELL_1_0 = ".s-cell-1-0";
// const CELL_2_0 = ".s-cell-2-0";
// const CELL_3_0 = ".s-cell-3-0";
// const CELL_5_0 = ".s-cell-5-1";
// const CELL_0_1 = ".s-cell-0-1";
// const CELL_1_1 = ".s-cell-1-1";
// const CELL_2_1 = ".s-cell-2-1";
// const CELL_3_1 = ".s-cell-3-1";

// TODO BB-1694 - Update the url after adding the Measure Value Filter example to the menu
// fixture("Measure Value Filter")
//     .page(config.url)
//     .beforeEach(loginUsingLoginForm(`${config.url}/hidden/measure-value-filter`));

// test("should filter the data with a comparison operator", async t => {
//     const pivotTableSelector = ".s-measure-value-filter-example-1 .s-pivot-table";
//     const comparisonFilterPresetSelector = ".s-measure-value-filter-example-1 .s-filter-button";
//
//     // check that pivot is unfiltered
//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//     await checkCellValue(t, pivotTableSelector, "San Jose - Saratoga", CELL_5_0);
//
//     // apply measure value filter
//     await t.click(Selector(comparisonFilterPresetSelector).nth(1));
//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//
//     // check applied filter
//     await checkCellValue(t, pivotTableSelector, "Highland Village", CELL_0_0);
//     await checkCellValue(t, pivotTableSelector, "Montgomery", CELL_1_0);
//     await checkCellValue(t, pivotTableSelector, "San Jose - Blossom Hill", CELL_2_0);
//     await checkCellValue(t, pivotTableSelector, "756,423", CELL_0_1);
//     await checkCellValue(t, pivotTableSelector, "1,406,548", CELL_1_1);
//     await checkCellValue(t, pivotTableSelector, "701,653", CELL_2_1);
// });

// test("should filter the data with a range operator", async t => {
//     const pivotTableSelector = ".s-measure-value-filter-example-1 .s-pivot-table";
//     const betweenFilterPresetSelector = ".s-measure-value-filter-example-1 .s-filter-button";
//
//     // check that pivot is unfiltered
//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//     await checkCellValue(t, pivotTableSelector, "San Jose - Saratoga", CELL_5_0);
//
//     // apply measure value filter
//     await t.click(Selector(betweenFilterPresetSelector).nth(2));
//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//
//     // check applied filter
//     await checkCellValue(t, pivotTableSelector, "Highland Village", CELL_0_0);
//     await checkCellValue(t, pivotTableSelector, "Irving", CELL_1_0);
//     await checkCellValue(t, pivotTableSelector, "San Jose - Blossom Hill", CELL_2_0);
//     await checkCellValue(t, pivotTableSelector, "San Jose - Saratoga", CELL_3_0);
//     await checkCellValue(t, pivotTableSelector, "756,423", CELL_0_1);
//     await checkCellValue(t, pivotTableSelector, "573,475", CELL_1_1);
//     await checkCellValue(t, pivotTableSelector, "701,653", CELL_2_1);
//     await checkCellValue(t, pivotTableSelector, "555,725", CELL_3_1);
// });

// test("should filter the data shown in %", async t => {
//     const pivotTableSelector = ".s-measure-value-filter-example-2 .s-pivot-table";
//     const applyMeasureValueFilterSelector = ".s-measure-value-filter-example-2 .s-filter-button";
//
//     // check that pivot is unfiltered
//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//     await checkCellValue(t, pivotTableSelector, "San Jose - Saratoga", CELL_5_0);
//
//     // apply measure value filter
//     await t.click(Selector(applyMeasureValueFilterSelector).nth(1));
//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//
//     // check applied filter
//     await checkCellValue(t, pivotTableSelector, "Highland Village", CELL_0_0);
//     await checkCellValue(t, pivotTableSelector, "Montgomery", CELL_1_0);
//     await checkCellValue(t, pivotTableSelector, "San Jose - Blossom Hill", CELL_2_0);
//     await checkCellValue(t, pivotTableSelector, "756,423", CELL_0_1);
//     await checkCellValue(t, pivotTableSelector, "1,406,548", CELL_1_1);
//     await checkCellValue(t, pivotTableSelector, "701,653", CELL_2_1);
// });

// test("should filter the data stacked to 100%", async t => {
//     const barChartSelector = ".s-measure-value-filter-example-3 .s-stacked-bar";
//     const applyMeasureValueFilterSelector = ".s-measure-value-filter-example-3 .s-filter-button";
//     const xAxisLabelsSelector = Selector(barChartSelector).find(".highcharts-xaxis-labels text");
//
//     // check that chart is unfiltered
//     await checkRenderChart(barChartSelector, t);
//     await t.expect(xAxisLabelsSelector.count).eql(6);
//
//     // apply measure value filter
//     await t.click(Selector(applyMeasureValueFilterSelector)).nth(1));
//     await checkRenderChart(barChartSelector, t);
//
//     // check applied filter
//     await t
//         .expect(xAxisLabelsSelector.nth(0).textContent)
//         .eql("Highland Village")
//         .expect(xAxisLabelsSelector.nth(1).textContent)
//         .eql("Montgomery")
//         .expect(xAxisLabelsSelector.nth(2).textContent)
//         .eql("San Jose - Blossom Hill");
// });

// test("should filter the data formatted in %", async t => {
//     const pivotTableSelector = ".s-measure-value-filter-example-4 .s-pivot-table";
//     const applyMeasureValueFilterSelector = ".s-measure-value-filter-example-4 .s-filter-button";
//
//     // check that pivot is unfiltered
//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//     await checkCellValue(t, pivotTableSelector, "San Jose - Saratoga", CELL_5_0);
//
//     // apply measure value filter
//     await t.click(Selector(applyMeasureValueFilterSelector).nth(1));
//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//
//     // check applied filter
//     await checkCellValue(t, pivotTableSelector, "Highland Village", CELL_0_0);
//     await checkCellValue(t, pivotTableSelector, "Montgomery", CELL_1_0);
//     await checkCellValue(t, pivotTableSelector, "San Jose - Blossom Hill", CELL_2_0);
//     await checkCellValue(t, pivotTableSelector, "756,423", CELL_0_1);
//     await checkCellValue(t, pivotTableSelector, "1,406,548", CELL_1_1);
//     await checkCellValue(t, pivotTableSelector, "701,653", CELL_2_1);
// });
