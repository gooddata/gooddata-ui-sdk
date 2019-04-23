// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import {
    loginUsingLoginForm,
    checkCellValue,
    waitForPivotTableStopLoading,
    checkCellHasClassName,
    checkCellHasNotClassName,
} from "./utils/helpers";
import {
    measuresDrillParams,
    rowAttributesDrillParams,
    columnAndRowAttributesDrillParams,
    measuresColumnAndRowAttributesDrillParams,
    measuresAndColumnAttributesDrillParams,
    measuresAndRowAttributesDrillParams,
} from "./PivotTableDynamicFixtures.js";

const PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES = ".s-pivot-table-measuresColumnAndRowAttributes";
const BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES = ".s-bucket-preset-measuresColumnAndRowAttributes";
const SORTING_PRESET_NOSORT = ".s-sorting-preset-noSort";
const SORTING_PRESET_BY_MENU_CATOGORY_ASC = ".s-sorting-preset-byMenuCategory";
const SORTING_PRESET_BY_LOCATION_STATE_DESC = ".s-sorting-preset-byLocationState";
const GROUP_ROWS_PRESET_ENABLED = ".s-group-rows-preset-activeGrouping";
const TOTALS_SUBTOTAL = ".s-total-preset-franchiseFeesMaxByLocationState";
const PINNED_TOP_ROW = ".ag-floating-top-container";
const AGGREGATION_WITH_SUBTOTALS_PRESET = ".s-total-preset-aggregationsWithSubTotals";
const TOTAL_SELECTOR_FIRST = ".s-pivot-table .gd-row-total.s-cell-0-0 .s-value";
const TOTAL_SELECTOR_SECOND = ".s-pivot-table .gd-row-total.s-cell-1-0 .s-value";
const TOTAL_SELECTOR_THIRD = ".s-pivot-table .gd-row-total.s-cell-2-0 .s-value";

const DRILLING_PRESET_MEASURE_FRANCHISE_FEES = ".s-drilling-preset-measure";
const DRILLING_PRESET_ATTRIBUTE_MENU_CATEGORY = ".s-drilling-preset-attributeMenuCategory";
const DRILLING_PRESET_ATTRIBUTE_VALUE_CALIFORNIA = ".s-drilling-preset-attributeValueCalifornia";
const DRILLING_PRESET_ATTRIBUTE_VALUE_JANUARY = ".s-drilling-preset-attributeValueJanuary";

const CELL_0_0 = ".s-cell-0-0";
const CELL_0_1 = ".s-cell-0-1";
const CELL_0_2 = ".s-cell-0-2";
const CELL_0_3 = ".s-cell-0-3";
const CELL_0_4 = ".s-cell-0-4";
const CELL_1_0 = ".s-cell-1-0";
const CELL_1_3 = ".s-cell-1-3";
const CELL_5_0 = ".s-cell-5-0";
const CELL_8_0 = ".s-cell-8-0";
const CELL_9_0 = ".s-cell-9-0";

const DRILLABLE_CELL_CLASSNAME = "gd-cell-drillable";
const HIDDEN_CELL_CLASSNAME = "s-gd-cell-hide";

const MENU_CATEGORY = "[col-id=a_2188] .s-header-cell-label";
const FRANCHISE_FEES = "[col-id=a_2009_1-a_2071_1-m_0] .s-header-cell-label";

const SUBTOTAL_ATTRIBUTE_LOCATION_NAME = "label-restaurantlocation-locationname";

async function checkRender(t, selector, cellSelector = ".ag-cell", checkClass, doClick = false) {
    const chart = Selector(selector);
    await t.expect(chart.exists).ok();
    if (cellSelector) {
        const cell = chart.find(cellSelector);
        await t.expect(cell.exists).ok();

        if (checkClass) {
            await t.expect(cell().hasClass(checkClass)).ok();
        }
        if (doClick) {
            await t.click(cell);
        }
    }
}

async function checkDrill(t, output, selector = ".s-output") {
    const outputElement = Selector(selector);
    await t.expect(outputElement.exists).ok();
    if (outputElement) {
        await t.expect(outputElement.textContent).eql(output);
    }
}

async function checkNodeIsTransparent(t, selector, isTransparent) {
    const color = await selector.getStyleProperty("color");
    const backgroundColor = await selector.getStyleProperty("background-color");
    const transparentColor = "rgba(0, 0, 0, 0)";
    const display = await selector.getStyleProperty("display");

    if (isTransparent && display !== "none") {
        await t.expect(color).eql(transparentColor);
        await t.expect(backgroundColor).eql(transparentColor);
    }
}

fixture("Pivot Table Dynamic")
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/hidden/pivot-table-dynamic`));

test("should add drillable classes and run onFiredDrillEvent with correct params", async t => {
    await t.click(Selector(".s-bucket-preset-measures"));
    await waitForPivotTableStopLoading(t);
    await checkRender(t, ".s-pivot-table-measures", CELL_0_0, DRILLABLE_CELL_CLASSNAME, true);
    await checkDrill(t, measuresDrillParams);

    await t.click(Selector(".s-bucket-preset-rowAttributes"));
    await waitForPivotTableStopLoading(t);
    await checkRender(t, ".s-pivot-table-rowAttributes", CELL_0_2, DRILLABLE_CELL_CLASSNAME, true);
    await checkDrill(t, rowAttributesDrillParams);

    await t.click(Selector(".s-bucket-preset-columnAndRowAttributes"));
    await waitForPivotTableStopLoading(t);
    await checkRender(t, ".s-pivot-table-columnAndRowAttributes", CELL_5_0, DRILLABLE_CELL_CLASSNAME, true);
    await checkDrill(t, columnAndRowAttributesDrillParams);

    await t.click(Selector(BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES));
    await waitForPivotTableStopLoading(t);
    await checkRender(
        t,
        PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES,
        CELL_0_3,
        DRILLABLE_CELL_CLASSNAME,
        true,
    );
    await checkDrill(t, measuresColumnAndRowAttributesDrillParams);

    await t.click(Selector(".s-bucket-preset-measuresAndColumnAttributes"));
    await waitForPivotTableStopLoading(t);
    await checkRender(
        t,
        ".s-pivot-table-measuresAndColumnAttributes",
        CELL_0_1,
        DRILLABLE_CELL_CLASSNAME,
        true,
    );
    await checkDrill(t, measuresAndColumnAttributesDrillParams);

    await t.click(Selector(".s-bucket-preset-measuresAndRowAttributes"));
    await waitForPivotTableStopLoading(t);
    await checkRender(t, ".s-pivot-table-measuresAndRowAttributes", CELL_5_0, DRILLABLE_CELL_CLASSNAME, true);
    await checkDrill(t, measuresAndRowAttributesDrillParams);
});

test("should sort PivotTable using sortBy prop", async t => {
    await t.click(Selector(BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES));
    await waitForPivotTableStopLoading(t);

    await t.click(Selector(".s-sorting-preset-byMenuCategory"));
    await waitForPivotTableStopLoading(t);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "$71,476", CELL_0_3);

    await t.click(Selector(".s-sorting-preset-byQ1JanFranchiseFees"));
    await waitForPivotTableStopLoading(t);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "$101,055", CELL_0_3);

    await t.click(Selector(".s-sorting-preset-byLocationStateAndQ1JanFranchiseFees"));
    await waitForPivotTableStopLoading(t);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "$71,476", CELL_1_3);

    await t.click(Selector(SORTING_PRESET_NOSORT));
    await waitForPivotTableStopLoading(t);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "$51,421", CELL_1_3);
});

test("should sort PivotTable on column header click", async t => {
    await t.click(Selector(BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES));
    await t.click(Selector(SORTING_PRESET_NOSORT));
    await waitForPivotTableStopLoading(t);

    await t.click(Selector(MENU_CATEGORY)); // Menu Category (initial should be ASC)
    await waitForPivotTableStopLoading(t);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "$51,918", CELL_1_3);

    await t.click(Selector(MENU_CATEGORY)); // Menu Category (toggled should be DESC)
    await waitForPivotTableStopLoading(t);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "$69,105", CELL_1_3);

    await t.click(Selector(MENU_CATEGORY)); // Menu Category (third state should be ASC again)
    await waitForPivotTableStopLoading(t);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "$51,918", CELL_1_3);

    await t.click(Selector(FRANCHISE_FEES)); // Franchise fees (initial should be DESC)
    await waitForPivotTableStopLoading(t);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "$81,350", CELL_1_3);

    await t.click(Selector(FRANCHISE_FEES)); // Franchise fees (toggled should be ASC)
    await waitForPivotTableStopLoading(t);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "$42,140", CELL_1_3);
});

test("should group cells only when sorted by first attribute", async t => {
    await t.click(Selector(BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES));
    await t.click(Selector(SORTING_PRESET_NOSORT));
    await t.click(Selector(GROUP_ROWS_PRESET_ENABLED));
    await waitForPivotTableStopLoading(t);

    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Alabama", CELL_0_0);
    await checkCellHasNotClassName(
        t,
        PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES,
        HIDDEN_CELL_CLASSNAME,
        CELL_0_0,
    );
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Alabama", CELL_1_0);
    await checkCellHasClassName(
        t,
        PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES,
        HIDDEN_CELL_CLASSNAME,
        CELL_1_0,
    );

    await t.click(Selector(FRANCHISE_FEES)); // Menu Category (initial should be ASC)
    await waitForPivotTableStopLoading(t);

    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "California", CELL_8_0);
    await checkCellHasNotClassName(
        t,
        PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES,
        HIDDEN_CELL_CLASSNAME,
        CELL_8_0,
    );
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "California", CELL_9_0);
    await checkCellHasNotClassName(
        t,
        PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES,
        HIDDEN_CELL_CLASSNAME,
        CELL_9_0,
    );
});

test("should display sticky header only for grouped attributes", async t => {
    await t.click(Selector(BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES));
    await t.click(Selector(SORTING_PRESET_NOSORT));
    await t.click(Selector(GROUP_ROWS_PRESET_ENABLED));
    await waitForPivotTableStopLoading(t);

    await checkNodeIsTransparent(t, Selector(`${PINNED_TOP_ROW} ${CELL_0_0}`), false);
    await checkNodeIsTransparent(t, Selector(`${PINNED_TOP_ROW} ${CELL_0_1}`), false);
    await checkNodeIsTransparent(t, Selector(`${PINNED_TOP_ROW} ${CELL_0_2}`), true);
    await checkNodeIsTransparent(t, Selector(`${PINNED_TOP_ROW} ${CELL_0_3}`), true);
    await checkNodeIsTransparent(t, Selector(`${PINNED_TOP_ROW} ${CELL_0_4}`), true);
});

// TODO: Delete once drilling on subtotals has been disabled
async function disableDrilling(t) {
    await t.click(Selector(DRILLING_PRESET_MEASURE_FRANCHISE_FEES));
    await t.click(Selector(DRILLING_PRESET_ATTRIBUTE_MENU_CATEGORY));
    await t.click(Selector(DRILLING_PRESET_ATTRIBUTE_VALUE_CALIFORNIA));
    await t.click(Selector(DRILLING_PRESET_ATTRIBUTE_VALUE_JANUARY));
}

test("should render subtotals when sorted by default (first attribute)", async t => {
    await t.click(Selector(BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES));
    await t.click(Selector(SORTING_PRESET_NOSORT));
    await t.click(Selector(GROUP_ROWS_PRESET_ENABLED));
    await disableDrilling(t);
    await t.click(Selector(TOTALS_SUBTOTAL));
    await waitForPivotTableStopLoading(t);

    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Max", ".s-cell-5-1");
});

test("should render subtotals when sorted by the first attribute", async t => {
    await t.click(Selector(BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES));
    await t.click(Selector(SORTING_PRESET_BY_LOCATION_STATE_DESC));
    await disableDrilling(t);
    await t.click(Selector(TOTALS_SUBTOTAL));
    await waitForPivotTableStopLoading(t);

    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Max", ".s-cell-5-1");
});

test("should not render subtotals when sorted by other than the first attribute", async t => {
    await t.click(Selector(BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES));
    await t.click(Selector(SORTING_PRESET_BY_MENU_CATOGORY_ASC));
    await disableDrilling(t);
    await t.click(Selector(TOTALS_SUBTOTAL));
    await waitForPivotTableStopLoading(t);

    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Irving", ".s-cell-5-1");
});

async function setupSubTotals(t) {
    await disableDrilling(t);
    await t.click(Selector(AGGREGATION_WITH_SUBTOTALS_PRESET));
    await t.click(Selector(GROUP_ROWS_PRESET_ENABLED));
    await waitForPivotTableStopLoading(t);
}

async function toggleTotal(t, measureHeaderIndex, aggregation, attribute) {
    const firstColumnHeader = Selector(`.s-table-measure-column-header-cell-${measureHeaderIndex}`).with({
        visibilityCheck: false,
    });

    // We need to move cursor out of table
    await t.hover(Selector(GROUP_ROWS_PRESET_ENABLED));
    await t.wait(500);

    await t.hover(firstColumnHeader);
    await t.wait(500);

    await t.click(await firstColumnHeader.find(".s-table-header-menu").with({ visibilityCheck: false }));

    const menu = Selector(".s-table-header-menu-content");

    // Total
    if (!attribute) {
        await t.click(await menu.find(`.s-menu-aggregation-${aggregation}`));
        return;
    }

    // Subtotal
    await t.hover(await menu.find(`.s-menu-aggregation-${aggregation}`));
    await t.wait(500);
    const submenu = Selector(".s-table-header-submenu-content");
    await t.click(await submenu.find(`.s-aggregation-item-${attribute}`));
}

test("should be able to add and remove totals via burgermenu", async t => {
    const total = Selector(TOTAL_SELECTOR_FIRST);
    await t.click(Selector(AGGREGATION_WITH_SUBTOTALS_PRESET));
    await toggleTotal(t, 0, "sum");
    await t.expect(total.textContent).eql("Sum");
    await toggleTotal(t, 0, "sum");
    await t.expect(total.exists).eql(false);
});

test("should be able to add and remove native total", async t => {
    const total = Selector(TOTAL_SELECTOR_FIRST);
    await t.click(Selector(AGGREGATION_WITH_SUBTOTALS_PRESET));
    await toggleTotal(t, 0, "nat");
    await t.expect(total.textContent).eql("Rollup (Total)");
    await toggleTotal(t, 0, "nat");
    await t.expect(total.exists).eql(false);
});

// test("should be able to add and remove multiple totals", async t => {
//     const total1 = Selector(TOTAL_SELECTOR_FIRST);
//     const total2 = Selector(TOTAL_SELECTOR_SECOND);
//     await setupSubTotals(t);
//     await toggleTotal(t, 0, "sum");
//     await toggleTotal(t, 0, "max");
//     await t.expect(total1.textContent).eql("Sum");
//     await t.expect(total2.textContent).eql("Max");
//     await toggleTotal(t, 0, "sum");
//     await toggleTotal(t, 0, "max");
//     await t.expect(total1.exists).eql(false);
//     await t.expect(total2.exists).eql(false);
// });

test("should show totals rows in particular order no matter the added totals order", async t => {
    await setupSubTotals(t);
    await toggleTotal(t, 0, "med");
    await toggleTotal(t, 0, "max");
    await toggleTotal(t, 0, "avg");
    await t.expect(Selector(TOTAL_SELECTOR_FIRST).textContent).eql("Max");
    await t.expect(Selector(TOTAL_SELECTOR_SECOND).textContent).eql("Avg");
    await t.expect(Selector(TOTAL_SELECTOR_THIRD).textContent).eql("Median");
});

test("should be able to add and remove subtotals via burgermenu", async t => {
    await setupSubTotals(t);
    await toggleTotal(t, 0, "sum", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Sum", ".s-cell-5-1");
    await toggleTotal(t, 0, "sum", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
    await checkCellValue(
        t,
        PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES,
        "Highland Village",
        ".s-cell-5-1",
    );
});

test("should remove subtotals when removing grandtotal of same type", async t => {
    await setupSubTotals(t);
    await toggleTotal(t, 0, "sum", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Sum", ".s-cell-5-1");
    await toggleTotal(t, 0, "sum");
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Sum", ".s-cell-5-1");
    await toggleTotal(t, 0, "sum");
    await checkCellValue(
        t,
        PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES,
        "Highland Village",
        ".s-cell-5-1",
    );
});

test("should be able to add and remove native subtotal", async t => {
    await setupSubTotals(t);
    await toggleTotal(t, 0, "nat", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Rollup (Total)", ".s-cell-5-1");
    await toggleTotal(t, 0, "nat", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
    await checkCellValue(
        t,
        PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES,
        "Highland Village",
        ".s-cell-5-1",
    );
});

// test("should be able to add and remove multiple subtotals", async t => {
//     await setupSubTotals(t);
//     await toggleTotal(t, 0, "sum", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
//     await toggleTotal(t, 0, "max", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
//     await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Sum", ".s-cell-5-1");
//     await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Max", ".s-cell-6-1");
//     await toggleTotal(t, 0, "sum", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
//     await toggleTotal(t, 0, "max", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
//     await checkCellValue(
//         t,
//         PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES,
//         "Highland Village",
//         ".s-cell-5-1",
//     );
// });

test("should show subtotal rows in particular order no matter the added subtotals order", async t => {
    await setupSubTotals(t);
    await toggleTotal(t, 0, "med", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
    await toggleTotal(t, 0, "max", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
    await toggleTotal(t, 0, "avg", SUBTOTAL_ATTRIBUTE_LOCATION_NAME);
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Max", ".s-cell-5-1");
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Avg", ".s-cell-6-1");
    await checkCellValue(t, PIVOT_TABLE_MEASURES_COLUMN_AND_ROW_ATTRIBUTES, "Median", ".s-cell-7-1");
});
