// (C) 2007-2020 GoodData Corporation
import { Selector, ClientFunction } from "testcafe";
import { navigateToStory } from "../_infra/testcafeUtils";
import { getCell, waitForPivotTableStopLoading, checkWidthWithTolerance } from "./utils";

fixture("Pivot Table Sizing").beforeEach(
    navigateToStory(
        "50-stories-for-e2e-tests-pivot-table--complex-table-with-multiple-columns-and-with-sizing",
    ),
);

const TABLE_SELECTOR_STR_COMPLEX = ".s-pivot-table-sizing";
const FIRST_CELL_AUTORESIZE_WIDTH = 105;
const LAST_CELL_AUTORESIZE_WIDTH = 105;
const AUTO_SIZE_TOLERANCE = 10;

test("should be autoresized all columns", async (t) => {
    const tableSelector = Selector(TABLE_SELECTOR_STR_COMPLEX);
    const firstCellSelectorStr = ".s-cell-0-0";
    const lastCellSelectorStr = ".s-cell-0-9";
    const scrollContainer = tableSelector.find(".ag-center-cols-viewport");
    const scrollFn = ClientFunction(
        (scrollValue) => {
            scrollContainer().scrollLeft = scrollValue;
        },
        { dependencies: { scrollContainer } },
    );

    await waitForPivotTableStopLoading(t, tableSelector);

    const firstCell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, firstCellSelectorStr);
    const resizedAttrFirstCellWidth = await firstCell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedAttrFirstCellWidth,
        FIRST_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of first table column",
    );

    await scrollFn(500);

    const lastCell = await getCell(t, TABLE_SELECTOR_STR_COMPLEX, lastCellSelectorStr);
    const resizedAttrLastCellWidth = await lastCell.getBoundingClientRectProperty("width");

    await checkWidthWithTolerance(
        t,
        resizedAttrLastCellWidth,
        LAST_CELL_AUTORESIZE_WIDTH,
        AUTO_SIZE_TOLERANCE,
        "Width of last table column",
    );
});
