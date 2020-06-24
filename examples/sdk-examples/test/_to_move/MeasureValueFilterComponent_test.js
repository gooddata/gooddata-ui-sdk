// // (C) 2007-2020 GoodData Corporation
// import { Selector } from "testcafe";
// import { loginUserAndNavigate } from "./utils/helpers";
// import { waitForPivotTableStopLoading, checkCellValue } from "./utils/pivotTableHelpers";
// import config from "./utils/config";

// const CELL_0_0 = ".s-cell-0-0";
// const CELL_0_1 = ".s-cell-0-1";
// const CELL_1_1 = ".s-cell-1-1";
// const CELL_2_1 = ".s-cell-2-1";

// const comparisonFilterDropdownSelector = Selector(".s-mvf-dropdown-button");
// const comparisonFilterOperatorDropdownSelector = Selector(".s-mvf-operator-dropdown-button");
// const greaterThanIconSelector = Selector(".icon-greater-than");
// const lessThanIconSelector = Selector(".icon-less-than");
// const comparisonInputSelector = Selector(".s-mvf-comparison-value-input");
// const applySelector = Selector(".s-mvf-dropdown-apply");

// fixture("Measure Value Filter").beforeEach(
//     loginUserAndNavigate(`${config.url}/measure-value-filter/component`),
// );

// test("should filter the data with a comparison operator", async t => {
//     const pivotTableSelector = Selector(".s-measure-value-filter-example-1");
//     await t.click(comparisonFilterDropdownSelector.nth(0));
//     await t.click(comparisonFilterOperatorDropdownSelector);
//     await t.click(greaterThanIconSelector);
//     await t.typeText(comparisonInputSelector, "10,000,000");
//     await t.click(applySelector);

//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//     // check applied filter
//     await checkCellValue(t, pivotTableSelector, "Montgomery", CELL_0_0);
//     await checkCellValue(t, pivotTableSelector, "16,077,036", CELL_0_1);
// });

// test("should filter the data shown in %", async t => {
//     const pivotTableSelector = Selector(".s-measure-value-filter-example-2");
//     await t.click(comparisonFilterDropdownSelector.nth(1));
//     await t.click(comparisonFilterOperatorDropdownSelector);
//     await t.click(greaterThanIconSelector);
//     await t.typeText(comparisonInputSelector, "700,000,000");
//     await t.click(applySelector);

//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//     // check applied filter
//     await checkCellValue(t, pivotTableSelector, "Highland Village", CELL_0_0);
//     await checkCellValue(t, pivotTableSelector, "842,850,068%", CELL_0_1);
// });

// test("should filter the data formatted in %", async t => {
//     const pivotTableSelector = Selector(".s-measure-value-filter-example-3");
//     await t.click(comparisonFilterDropdownSelector.nth(2));
//     await t.click(comparisonFilterOperatorDropdownSelector);
//     await t.click(greaterThanIconSelector);
//     await t.typeText(comparisonInputSelector, "7,000,000");
//     await t.click(applySelector);

//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//     // check applied filter
//     await checkCellValue(t, pivotTableSelector, "Highland Village", CELL_0_0);
//     await checkCellValue(t, pivotTableSelector, "26.10%", CELL_0_1);
// });

// test("should filter dropdown with custom button", async t => {
//     const pivotTableSelector = Selector(".s-measure-value-filter-example-4");
//     await t.click(comparisonFilterDropdownSelector.nth(3));
//     await t.click(comparisonFilterOperatorDropdownSelector);
//     await t.click(greaterThanIconSelector);
//     await t.typeText(comparisonInputSelector, "10,000,000");
//     await t.click(applySelector);

//     await waitForPivotTableStopLoading(t, pivotTableSelector);
//     // check applied filter
//     await checkCellValue(t, pivotTableSelector, "Montgomery", CELL_0_0);
//     await checkCellValue(t, pivotTableSelector, "16,077,036", CELL_0_1);
// });

// test("should filter the data with treat null value as zero", async t => {
//     const pivotTableSelector = Selector(".s-measure-value-filter-example-5");
//     await t.click(comparisonFilterDropdownSelector.nth(4));
//     await t.click(comparisonFilterOperatorDropdownSelector);
//     await t.click(lessThanIconSelector);
//     await t.typeText(comparisonInputSelector, "10");
//     await t.click(applySelector);

//     await waitForPivotTableStopLoading(t, pivotTableSelector);

//     await checkCellValue(t, pivotTableSelector, "1.00", CELL_0_1);
//     await checkCellValue(t, pivotTableSelector, "–", CELL_1_1);
//     await checkCellValue(t, pivotTableSelector, "–", CELL_2_1);
// });
