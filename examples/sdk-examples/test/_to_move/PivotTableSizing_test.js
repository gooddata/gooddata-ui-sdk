// // (C) 2007-2020 GoodData Corporation
// import { Selector } from "testcafe";
// import { config } from "./utils/config";
// import { checkCellValue, loginUserAndNavigate } from "./utils/helpers";

// fixture("Pivot Table Sizing").beforeEach(loginUserAndNavigate(`${config.url}/hidden/pivot-table-sizing`));

// test("should render all tables", async t => {
//     const firstCellSelector = ".s-cell-0-0";
//     await checkCellValue(t, ".s-pivot-table-sizing", "Aaron Clements", firstCellSelector);
//     await checkCellValue(t, ".s-pivot-table-sizing-with-subtotals", "Alabama", firstCellSelector);
//     await checkCellValue(
//         t,
//         ".s-pivot-table-sizing-with-attribute-filter",
//         "10-ounce Steak Mary Anne",
//         firstCellSelector,
//     );
// });

// async function filterOutLongAttributeElements(t, tableWrapper) {
//     const secondCell = ".s-cell-0-1";
//     const wrapper = Selector(tableWrapper);
//     await checkCellValue(t, tableWrapper, "520,409", secondCell);
//     await t
//         .click(wrapper.find(".s-menu_item_name"))
//         .click(Selector(".s-clear"))
//         .typeText(Selector(".gd-list-searchfield .gd-input-field"), "Agnello");
//     await Selector(".gd-attribute-filter-overlay .s-isLoading", { visibilityCheck: true })();
//     await t.click(Selector(".s-attribute-filter-list-item").nth(0)).click(Selector(".s-apply"));
//     await checkCellValue(t, tableWrapper, "615,726", secondCell);
// }

// test("should trigger resize after attribute filter change", async t => {
//     const tableWrapper = ".s-pivot-table-sizing-with-attribute-filter";
//     const firstAttributeCellSelector = ".s-cell-0-0";
//     const originalWidth = await Selector(tableWrapper).find(firstAttributeCellSelector).clientWidth;
//     await filterOutLongAttributeElements(t, tableWrapper);
//     const newWidth = await Selector(tableWrapper).find(firstAttributeCellSelector).clientWidth;
//     await t.expect(newWidth).lt(originalWidth);
// });

// async function resizeTable(t, tableQuerySelector, width) {
//     await t.eval(
//         () => {
//             document.querySelector(tableQuerySelector).style.width = width;
//         },
//         { dependencies: { tableQuerySelector, width } },
//     );
// }

// async function resizeAndVerifyColumnVisibility(t, tableSelector, columnSelector) {
//     const tableElement = Selector(tableSelector);
//     const columnElement = await tableElement.find(columnSelector);
//     await t.expect(columnElement.exists).eql(false);
//     await resizeTable(t, tableSelector, "1200px");
//     await t.expect(columnElement.visible).eql(true);
// }

// test("should resize newly displayed columns after the whole table is resized", async t => {
//     const table = ".s-pivot-table-sizing-with-subtotals";
//     const originalAttributeCell = ".s-cell-1-4";
//     const newlyDisplayedAttributeCell = ".s-cell-1-8";

//     await resizeAndVerifyColumnVisibility(t, table, newlyDisplayedAttributeCell);
//     const newlyDisplayedColumnWidth = await Selector(table).find(newlyDisplayedAttributeCell).clientWidth;
//     const originalColumnWidth = await Selector(table).find(originalAttributeCell).clientWidth;
//     await t.expect(newlyDisplayedColumnWidth).eql(originalColumnWidth);
// });
