// (C) 2007-2020 GoodData Corporation
import { ReferenceMd, ReferenceData } from "@gooddata/reference-workspace";
import { attributeLocalId, measureLocalId } from "@gooddata/sdk-model";
import { Selector } from "testcafe";
import { navigateToStory, sleep } from "../_infra/testcafeUtils";

import {
    getCell,
    waitForPivotTableStopLoading,
    dragResizer,
    checkWidthWithTolerance,
    getCallbackArray,
    getAttributeColumnWidthItemByIdentifier,
    getMeasureColumnWidthItemByLocator,
    getAllMeasureColumnWidth,
    setAutoResize,
} from "./utils";

fixture("Pivot Table Sizing and Reset by double click").beforeEach(
    navigateToStory("50-stories-for-e2e-tests-pivot-table--complex-table-with-resizing"),
);

const TABLE_SELECTOR_STR_COMPLEX = ".s-pivot-table-sizing-complex";
const CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR = ".s-change-width-button-attribute";
const CHANGE_WIDTH_BUTTON_MEASURE_STR = ".s-change-width-button-measure";
const ADD_ALL_MEASURE_WIDTH_BUTTON = ".s-change-width-button-measure-all";
const TURN_ON_GROW_TO_FIT_COMPLEX = ".s-pivot-table-sizing-complex-grow-to-fit-checkbox";

const AGGRID_ON_RESIZE_TIMEOUT = 500;
const AUTO_SIZE_TOLERANCE = 10;
const DND_SIZE_TOLERANCE = 10;
const CELL_DEFAULT_WIDTH = 200;
const FIRST_CELL_AUTORESIZE_WIDTH = 111;
const SECOND_CELL_AUTORESIZE_WIDTH = 110;
const SECOND_CELL_GROW_TO_FIT_WIDTH = 288;
const FIRST_CELL_MANUAL_WIDTH = 400;
const SECOND_CELL_MANUAL_WIDTH = 60;
const ATTRIBUTE_IDENTIFIER = attributeLocalId(ReferenceMd.Product.Name);
const MEASURE_LOCATOR_ITEM = measureLocalId(ReferenceMd.Amount);
const ATTRIBUTE_LOCATOR_ITEM_ATT_ID = attributeLocalId(ReferenceMd.Region);
const ATTRIBUTE_LOCATOR_ITEM_ATT_ELM = ReferenceData.Region.EastCoast.uri;

const getFirstCellResizer = async (t, tableSelectorStr) => {
    const tableSelector = Selector(tableSelectorStr);
    await t.expect(tableSelector.exists).eql(true, `${tableSelectorStr} not found`);

    const firstHeaderCell = `.s-table-measure-column-header-group-cell-0.gd-column-group-header--first .ag-header-cell-resize`;

    return await tableSelector.find(firstHeaderCell);
};

const getSecondCellResizer = async (t, tableSelectorStr) => {
    const tableSelector = Selector(tableSelectorStr);
    await t.expect(tableSelector.exists).eql(true, `${tableSelectorStr} not found`);

    const secondHeaderCell = `.s-table-measure-column-header-group-cell-0.s-table-measure-column-header-index-1 .ag-header-cell-resize`;

    return await tableSelector.find(secondHeaderCell);
};

// first attribute column

test("should reset first column with default width by double click to auto size and notify column as manually resized via props", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-0";
    const expectedCallBackArrayItemsCount = 1;

    await waitForPivotTableStopLoading(t, tableSelector);

    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const actualCellWidth = await cell.getBoundingClientRectProperty("width");
    await t.expect(actualCellWidth).eql(CELL_DEFAULT_WIDTH);

    const resizer = await getFirstCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer);

    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    const resizedCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        resizedCellWidth,
        FIRST_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const callBack = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBack.length).eql(expectedCallBackArrayItemsCount);

    const item = getAttributeColumnWidthItemByIdentifier(callBack, ATTRIBUTE_IDENTIFIER);

    await t.expect(item).notEql(undefined);
    await checkWidthWithTolerance(
        t,
        item.attributeColumnWidthItem.width.value,
        FIRST_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of item from callback array",
    );
});

test("should change first column with manual width by double click to auto size and notify column as manually resized via props", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-0";
    const expectedCallBackArrayItemsCount = 1;

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);

    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const actualCellWidth = await cell.getBoundingClientRectProperty("width");
    await t.expect(actualCellWidth).eql(FIRST_CELL_MANUAL_WIDTH);

    const resizer = await getFirstCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer);

    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    const resizedCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        resizedCellWidth,
        FIRST_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const callBack = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBack.length).eql(expectedCallBackArrayItemsCount);

    const item = getAttributeColumnWidthItemByIdentifier(callBack, ATTRIBUTE_IDENTIFIER);
    await t.expect(item).notEql(undefined);
    await checkWidthWithTolerance(
        t,
        item.attributeColumnWidthItem.width.value,
        FIRST_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of item from callback array",
    );
});

test("when auto resize is on should reset first column with manual width by double click to auto size and remove this column from manually resized via props", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-0";
    const expectedCallBackArrayItemsCount = 0;

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);

    await setAutoResize(t, TABLE_SELECTOR_STR_COMPLEX);

    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const actualCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        actualCellWidth,
        FIRST_CELL_MANUAL_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const resizer = await getFirstCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer);

    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    const resizedCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        resizedCellWidth,
        FIRST_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const callBack = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBack.length).eql(expectedCallBackArrayItemsCount);
});

test("should resize first column by DnD and notify column as manually resized via props", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-0";
    const dragOffset = 100;
    const expectedCallBackArrayItemsCount = 1;

    await waitForPivotTableStopLoading(t, tableSelector);

    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const actualCellWidth = await cell.getBoundingClientRectProperty("width");
    await t.expect(actualCellWidth).eql(CELL_DEFAULT_WIDTH);

    const resizer = await getFirstCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await dragResizer(t, resizer, dragOffset);

    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    const resizedCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        resizedCellWidth,
        CELL_DEFAULT_WIDTH + dragOffset,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    const callBack = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBack.length).eql(expectedCallBackArrayItemsCount);

    const item = getAttributeColumnWidthItemByIdentifier(callBack, ATTRIBUTE_IDENTIFIER);
    await t.expect(item).notEql(undefined);
    await checkWidthWithTolerance(
        t,
        item.attributeColumnWidthItem.width.value,
        CELL_DEFAULT_WIDTH + dragOffset,
        DND_SIZE_TOLERANCE,
        "Width of item from callback array",
    );
});

// second measure column

test("should reset second column with default width by double click to auto size and notify column as manually resized via props", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-1";
    const expectedCallBackArrayItemsCount = 1;

    await waitForPivotTableStopLoading(t, tableSelector);

    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const actualCellWidth = await cell.getBoundingClientRectProperty("width");
    await t.expect(actualCellWidth).eql(CELL_DEFAULT_WIDTH);

    const resizer = await getSecondCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer);

    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    const resizedCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        resizedCellWidth,
        SECOND_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const callBack = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBack.length).eql(expectedCallBackArrayItemsCount);

    const item = getMeasureColumnWidthItemByLocator(
        callBack,
        MEASURE_LOCATOR_ITEM,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
    );
    await t.expect(item).notEql(undefined);
    await checkWidthWithTolerance(
        t,
        item.measureColumnWidthItem.width.value,
        SECOND_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of item from callback array",
    );
});

test("should reset second column with manual width by double click to auto size and notify column as manually resized via props", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-1";
    const expectedCallBackArrayItemsCount = 1;

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(CHANGE_WIDTH_BUTTON_MEASURE_STR);

    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const actualCellWidth = await cell.getBoundingClientRectProperty("width");
    await t.expect(actualCellWidth).eql(SECOND_CELL_MANUAL_WIDTH);

    const resizer = await getSecondCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer);

    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    const resizedCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        resizedCellWidth,
        SECOND_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const callBack = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBack.length).eql(expectedCallBackArrayItemsCount);

    const item = getMeasureColumnWidthItemByLocator(
        callBack,
        MEASURE_LOCATOR_ITEM,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
    );
    await t.expect(item).notEql(undefined);
    await checkWidthWithTolerance(
        t,
        item.measureColumnWidthItem.width.value,
        SECOND_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of item from callback array",
    );
});

test("when auto resize is on should reset second column with manual width by double click to auto size and remove this column from manually resized via props", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-1";
    const expectedCallBackArrayItemsCount = 0;

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(CHANGE_WIDTH_BUTTON_MEASURE_STR);

    await setAutoResize(t, TABLE_SELECTOR_STR_COMPLEX);

    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const actualCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        actualCellWidth,
        SECOND_CELL_MANUAL_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const resizer = await getSecondCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer);

    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    const resizedCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        resizedCellWidth,
        SECOND_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const callBack = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBack.length).eql(expectedCallBackArrayItemsCount);
});

test("should resize second column by DnD and notify column as manually resized via props", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-1";
    const dragOffset = 100;
    const expectedCallBackArrayItemsCount = 1;

    await waitForPivotTableStopLoading(t, tableSelector);

    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const actualCellWidth = await cell.getBoundingClientRectProperty("width");
    await t.expect(actualCellWidth).eql(CELL_DEFAULT_WIDTH);

    const resizer = await getSecondCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await dragResizer(t, resizer, dragOffset);

    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    const resizedCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        resizedCellWidth,
        CELL_DEFAULT_WIDTH + dragOffset,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    const callBack = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBack.length).eql(expectedCallBackArrayItemsCount);

    const item = getMeasureColumnWidthItemByLocator(
        callBack,
        MEASURE_LOCATOR_ITEM,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
    );
    await t.expect(item).notEql(undefined);
    await checkWidthWithTolerance(
        t,
        item.measureColumnWidthItem.width.value,
        CELL_DEFAULT_WIDTH + dragOffset,
        DND_SIZE_TOLERANCE,
        "Width of item from callback array",
    );
});

test("should resize second column by DnD while meta key pressed and resize all measure columns", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-1";
    const lastCellSelectorStr = ".s-cell-0-2";
    const dragOffset = -100;
    const expectedCallBackArrayItemsCount = 1;

    await waitForPivotTableStopLoading(t, tableSelector);

    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    // before resize
    const actualCellWidth = await cell.getBoundingClientRectProperty("width");
    await t.expect(actualCellWidth).eql(CELL_DEFAULT_WIDTH);

    // resize by dnd -100px
    const resizer = await getSecondCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await dragResizer(t, resizer, dragOffset, true);

    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    // after resize first cell
    const resizedCellWidth = await cell.getBoundingClientRectProperty("width");
    await checkWidthWithTolerance(
        t,
        resizedCellWidth,
        CELL_DEFAULT_WIDTH + dragOffset,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    // after resize last cell
    const cellLast = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, lastCellSelectorStr);
    const resizedLastCellWidth = await cellLast.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedLastCellWidth,
        CELL_DEFAULT_WIDTH + dragOffset,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    // check callback
    const callBack = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBack.length).eql(expectedCallBackArrayItemsCount);

    const item = getAllMeasureColumnWidth(callBack);

    await t.expect(item).notEql(undefined);
    await checkWidthWithTolerance(
        t,
        item.measureColumnWidthItem.width.value,
        CELL_DEFAULT_WIDTH + dragOffset,
        DND_SIZE_TOLERANCE,
        "Width of item from callback array",
    );
});

test("should reset previously resized column with metaKey and notify column as manually resized via props", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-1";
    const expectedCallBackArrayItemsCount = 2;

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(ADD_ALL_MEASURE_WIDTH_BUTTON);

    const resizer = await getSecondCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer);
    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    // after reset
    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const resizedLastCellWidth = await cell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedLastCellWidth,
        SECOND_CELL_AUTORESIZE_WIDTH,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    // check callback
    const callBackAfterReset = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBackAfterReset.length).eql(expectedCallBackArrayItemsCount);

    const itemAfterReset = getMeasureColumnWidthItemByLocator(
        callBackAfterReset,
        MEASURE_LOCATOR_ITEM,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
    );

    await t.expect(itemAfterReset).notEql(undefined);
    await checkWidthWithTolerance(
        t,
        itemAfterReset.measureColumnWidthItem.width.value,
        SECOND_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of item from callback array",
    );
});

test("when autosize on it should reset previously resized column with metaKey and notify column as manually resized via props with value auto", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-1";
    const expectedCallBackArrayItemsCount = 2;

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(ADD_ALL_MEASURE_WIDTH_BUTTON);
    await setAutoResize(t, TABLE_SELECTOR_STR_COMPLEX);

    const resizer = await getSecondCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer);
    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    // after reset
    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const resizedLastCellWidth = await cell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedLastCellWidth,
        SECOND_CELL_AUTORESIZE_WIDTH,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    // check callback
    const callBackAfterReset = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBackAfterReset.length).eql(expectedCallBackArrayItemsCount);

    const itemAfterReset = getMeasureColumnWidthItemByLocator(
        callBackAfterReset,
        MEASURE_LOCATOR_ITEM,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
        ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
    );

    await t.expect(itemAfterReset).notEql(undefined);

    await t.expect(itemAfterReset.measureColumnWidthItem.width.value).eql("auto");
});

test("should remove all measure width when reset with metaKey and all measures columns should be auto sized", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-1";
    const expectedCallBackArrayItemsCount = 2;

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(ADD_ALL_MEASURE_WIDTH_BUTTON);

    const resizer = await getSecondCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer, { modifiers: { meta: true } });
    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    // after reset
    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const resizedLastCellWidth = await cell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedLastCellWidth,
        SECOND_CELL_AUTORESIZE_WIDTH,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    // check callback
    const callBackAfterReset = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBackAfterReset.length).eql(expectedCallBackArrayItemsCount);

    const item = getAllMeasureColumnWidth(callBackAfterReset);
    await t.expect(item).eql(undefined);
});

test("should reset all measaure columns and apply correctly grow to fit on them", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const cellSelectorStr = ".s-cell-0-1";
    const expectedCallBackArrayItemsCount = 3;

    await t.click(TURN_ON_GROW_TO_FIT_COMPLEX);

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);
    await t.click(ADD_ALL_MEASURE_WIDTH_BUTTON);

    const resizer = await getSecondCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer, { modifiers: { meta: true } });
    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    // after reset
    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, cellSelectorStr);
    const resizedLastCellWidth = await cell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedLastCellWidth,
        SECOND_CELL_GROW_TO_FIT_WIDTH,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    // check callback
    const callBackAfterReset = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBackAfterReset.length).eql(expectedCallBackArrayItemsCount);

    const item = getAllMeasureColumnWidth(callBackAfterReset);
    await t.expect(item).eql(undefined);
});

test("should not reset all measaure columns when doubleclicked with meta key on attribute resizer", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const attrCellSelectorStr = ".s-cell-0-0";
    const measureCellSelectorStr = ".s-cell-0-1";
    const expectedCallBackArrayItemsCount = 2;

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);
    await t.click(ADD_ALL_MEASURE_WIDTH_BUTTON);

    const resizer = await getFirstCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer, { modifiers: { meta: true } });
    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    // after reset
    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, attrCellSelectorStr);
    const resizedAttrCellWidth = await cell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedAttrCellWidth,
        FIRST_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const measureCell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, measureCellSelectorStr);
    const resizedMeasureCellWidth = await measureCell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedMeasureCellWidth,
        SECOND_CELL_MANUAL_WIDTH,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    // check callback
    const callBackAfterReset = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBackAfterReset.length).eql(expectedCallBackArrayItemsCount);

    const item = getAllMeasureColumnWidth(callBackAfterReset);
    await t.expect(item).notEql(undefined);
});

test("should not reset all measaure columns when doubleclicked with alt key on attribute resizer", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const attrCellSelectorStr = ".s-cell-0-0";
    const measureCellSelectorStr = ".s-cell-0-1";
    const expectedCallBackArrayItemsCount = 2;

    await waitForPivotTableStopLoading(t, tableSelector);

    await t.click(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);
    await t.click(ADD_ALL_MEASURE_WIDTH_BUTTON);

    const resizer = await getFirstCellResizer(t, TABLE_SELECTOR_STR_COMPLEX);
    await t.doubleClick(resizer, { modifiers: { alt: true } });
    await sleep(AGGRID_ON_RESIZE_TIMEOUT);

    // after reset
    const cell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, attrCellSelectorStr);
    const resizedAttrCellWidth = await cell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedAttrCellWidth,
        FIRST_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of table column",
    );

    const measureCell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, measureCellSelectorStr);
    const resizedMeasureCellWidth = await measureCell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedMeasureCellWidth,
        SECOND_CELL_MANUAL_WIDTH,
        DND_SIZE_TOLERANCE,
        "Width of table column",
    );

    // check callback
    const callBackAfterReset = await getCallbackArray(TABLE_SELECTOR_STR_COMPLEX);
    await t.expect(callBackAfterReset.length).eql(expectedCallBackArrayItemsCount);

    const item = getAllMeasureColumnWidth(callBackAfterReset);
    await t.expect(item).notEql(undefined);
});
