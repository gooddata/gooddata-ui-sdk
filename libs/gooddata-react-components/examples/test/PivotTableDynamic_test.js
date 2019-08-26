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
const TOTALS_PRESET_FRANCHISE_FEES_SUM = ".s-total-preset-franchiseFeesSum";
const TOTALS_PRESET_FRANCHISE_FEES_AVG = ".s-total-preset-franchiseFeesAvg";
const PINNED_TOP_ROW = ".ag-floating-top-container";

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

const MENU_CATEGORY = ".s-table-measure-column-header-group-cell-2 .s-header-cell-label";
const FRANCHISE_FEES =
    ".s-table-measure-column-header-group-cell-0.s-table-measure-column-header-cell-0 .s-header-cell-label";

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

test("should find classnames used for styling", async t => {
    await t.click(Selector(BUCKET_PRESET_MEASURES_COLUMN_AND_ROW_ATTRIBUTES));
    await t.click(Selector(SORTING_PRESET_NOSORT));
    await t.click(Selector(GROUP_ROWS_PRESET_ENABLED));
    await t.click(Selector(TOTALS_PRESET_FRANCHISE_FEES_SUM));
    await t.click(Selector(TOTALS_PRESET_FRANCHISE_FEES_AVG));
    await waitForPivotTableStopLoading(t);

    const classnames = [
        ".ag-root-wrapper",
        ".ag-root",
        ".ag-font-style",
        ".ag-header-cell",
        ".ag-header-group-cell",
        ".ag-header-group-cell-with-group",
        ".ag-header-cell-sortable",
        ".ag-header",
        ".ag-cell",
        ".ag-cell .ag-react-container",
        ".ag-header-cell-resize",
        ".ag-header-row",
        ".ag-header-row .ag-header-cell",
        ".ag-header-row .ag-header-group-cell-with-group",
        ".ag-floating-bottom",
        ".ag-floating-top",
        ".ag-floating-top .ag-row",
        ".ag-floating-top .ag-row .ag-cell",
    ];

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < classnames.length; i += 1) {
        const element = await Selector(`.s-pivot-table ${classnames[i]}`);
        await t.expect(element.exists).eql(true, `${classnames[i]} not found`);
    }
    /* eslint-enable no-await-in-loop */
});
