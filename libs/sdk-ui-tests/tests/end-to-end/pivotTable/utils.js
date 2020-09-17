// (C) 2020 GoodData Corporation
import { Selector } from "testcafe";

export async function getCell(t, selector, cellSelector) {
    const table = Selector(selector);
    await t.expect(table.exists).eql(true, `${selector} not found`);
    if (!cellSelector) {
        return null;
    }
    const cell = await table.find(`.ag-body-viewport ${cellSelector}`);
    await t.expect(cell.exists).eql(true, `${cellSelector} not found in ${selector}`);
    return cell;
}

export async function checkCellValue(t, selector, cellValue, cellSelector = ".ag-cell") {
    const cell = await getCell(t, selector, cellSelector);
    if (cellValue) {
        await t
            .expect(cell.textContent)
            .eql(cellValue, `expected ${cellSelector} to contain text ${cellValue}`);
    }
}

export async function checkCellHasClassName(t, selector, expectedClassName, cellSelector) {
    const cell = await getCell(t, selector, cellSelector);
    await t
        .expect(cell.hasClass(expectedClassName))
        .ok(`expected ${cellSelector} to has class ${expectedClassName}`);
}

export async function checkCellHasNotClassName(t, selector, expectedClassName, cellSelector) {
    const cell = await getCell(t, selector, cellSelector);
    await t
        .expect(cell.hasClass(expectedClassName))
        .notOk(`expected ${cellSelector} to has not class ${expectedClassName}`);
}

export const waitForPivotTableStopLoading = async (t, pivotSelector) => {
    const loadingSelectorString = ".s-pivot-table .s-loading";
    const loadingSelector = pivotSelector
        ? pivotSelector.find(loadingSelectorString)
        : Selector(loadingSelectorString);
    await t.expect(loadingSelector.exists).notOk({ timeout: 15000 });
};

export const getMenu = (cell) => {
    return cell.find(".s-table-header-menu");
};

export const clickOnMenuAggregationItem = async (t, cell, aggregationItemClass, attribute) => {
    await t.hover(cell);
    const menu = getMenu(cell);
    await t.click(menu);

    const sumTotal = Selector(aggregationItemClass).find(".s-menu-aggregation-inner");

    if (attribute) {
        await t.hover(sumTotal);
        await t.wait(1000);
        const submenu = Selector(".s-table-header-submenu-content");
        await t.click(submenu.find(`.s-aggregation-item-${attribute}`));
    } else {
        await t.click(sumTotal);
    }

    await waitForPivotTableStopLoading(t);
};

export async function sortColumn(t, tableSelectorStr, columnIndex) {
    const tableSelector = Selector(tableSelectorStr);
    await t.expect(tableSelector.exists).eql(true, `${tableSelectorStr} not found`);
    const tableHeader = tableSelector
        .find(".s-pivot-table-column-header .s-header-cell-label")
        .nth(columnIndex);
    await t.click(tableHeader);
    await t.expect(tableHeader.find(".s-sort-direction-arrow").exists).ok();
    await waitForPivotTableStopLoading(t);
}

export const dragResizer = async (t, resizer, destinationOffsetX, metaKey = false, altKey = false) => {
    const dragOptions = { speed: 0.55, modifiers: { meta: metaKey, alt: altKey } };

    await t.drag(resizer, destinationOffsetX, 0, dragOptions);
};

export const checkWidthWithTolerance = async (t, actualWidth, expectedWidth, tolerance, info) => {
    await t.expect(Math.abs(actualWidth - expectedWidth)).lte(tolerance, info);
};

export const getCallbackArray = async (tableSelectorStr) => {
    const callbackSelector = Selector(`${tableSelectorStr}-callback`);
    const innerText = await callbackSelector.innerText;
    return JSON.parse(innerText);
};

export const setAutoResize = async (t, tableSelectorStr) => {
    const tableSelector = Selector(tableSelectorStr);
    // example component change also PivotTable key so by this checkbox we simulate init render
    await t.click(`${tableSelectorStr}-autoresize-checkbox`);
    await waitForPivotTableStopLoading(t, tableSelector);
};

export const isAttributeColumnWidthItem = (columnWidthItem) => {
    return columnWidthItem && columnWidthItem.attributeColumnWidthItem !== undefined;
};

export const isMeasureColumnWidthItem = (columnWidthItem) => {
    return (
        columnWidthItem &&
        columnWidthItem.measureColumnWidthItem !== undefined &&
        columnWidthItem.measureColumnWidthItem.locators !== undefined
    );
};

export const isAllMeasureColumnWidthItem = (columnWidthItem) => {
    return (
        columnWidthItem &&
        columnWidthItem.measureColumnWidthItem !== undefined &&
        columnWidthItem.measureColumnWidthItem.locators === undefined
    );
};

export const getAttributeColumnWidthItemByIdentifier = (data, attributeIdentifier) => {
    return data.find((item) => {
        if (isAttributeColumnWidthItem(item)) {
            return item.attributeColumnWidthItem.attributeIdentifier === attributeIdentifier;
        }
        return false;
    });
};

export const getMeasureColumnWidthItemByLocator = (data, measureIdentifier, attributeIdentifier, element) => {
    return data.find((item) => {
        if (isMeasureColumnWidthItem(item)) {
            return (
                item.measureColumnWidthItem.locators[0].attributeLocatorItem.attributeIdentifier ===
                    attributeIdentifier &&
                item.measureColumnWidthItem.locators[0].attributeLocatorItem.element === element &&
                item.measureColumnWidthItem.locators[1].measureLocatorItem.measureIdentifier ===
                    measureIdentifier
            );
        }
        return false;
    });
};

export const getAllMeasureColumnWidth = (data) => {
    return data.find(isAllMeasureColumnWidthItem);
};

export const getMeasureCell = (column) => {
    return Selector(`.s-table-measure-column-header-cell-${column}`);
};

export const getMeasureGroupCell = (column) => {
    return Selector(`.s-table-measure-column-header-group-cell-${column}`);
};

export const getPivotTableFooterCell = (row, column) => {
    return Selector(`[row-index="b-${row}"] .s-cell-${row}-${column}`);
};
