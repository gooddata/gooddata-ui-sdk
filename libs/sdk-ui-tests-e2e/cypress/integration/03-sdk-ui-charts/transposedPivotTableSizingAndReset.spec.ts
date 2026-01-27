// (C) 2023-2026 GoodData Corporation

import { measureLocalId } from "@gooddata/sdk-model";

import * as Md from "../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";
import { visit } from "../../tools/navigation";
import { Table } from "../../tools/table";

const TABLE_SELECTOR_STR_COMPLEX = ".s-pivot-table-sizing-complex";
const CHANGE_WIDTH_BUTTON_SLICE_MEASURE_STR = ".s-change-width-button-slice-measure";
const CHANGE_WIDTH_BUTTON_MIXED_VALUE_STR = ".s-change-width-button-mixed-values-measure";
const TURN_ON_AUTO_SIZE_COMPLEX = ".s-pivot-table-sizing-complex-autoresize-checkbox";
const TURN_ON_GROW_TO_FIT_COMPLEX = ".s-pivot-table-sizing-complex-grow-to-fit-checkbox";

const SECOND_CELL_AUTORESIZE_WIDTH = 110;
const SECOND_CELL_MANUAL_WIDTH = 60;
const AG_GRID_ON_RESIZE_TIMEOUT = 500;
const CELL_DEFAULT_WIDTH = 200;
const FIRST_CELL_MANUAL_WIDTH = 400;
const FIRST_SLICE_MEASURE_CELL_AUTORESIZE_WIDTH = 80;
const FIRST_MIXED_VALUES_CELL_AUTORESIZE_WIDTH = 110;
const AUTO_SIZE_TOLERANCE = 10;
const TOTAL_SIZE = 1000;

const MEASURE_LOCATOR_ITEM = measureLocalId(Md.Amount);

const clickItem = (buttonSelector: string) => {
    cy.get(buttonSelector).click();
};

const checkWidthWithTolerance = (width: Cypress.Chainable<JQuery<number>>, expectedWidth: number) => {
    width
        .should("be.greaterThan", expectedWidth - AUTO_SIZE_TOLERANCE)
        .should("be.lessThan", expectedWidth + AUTO_SIZE_TOLERANCE);
};

const getSliceMeasureCellResizer = () => {
    const firstHeaderCell =
        ".s-table-measure-column-header-group-cell-1.gd-column-group-header--first .ag-header-cell-resize";
    return cy.get(TABLE_SELECTOR_STR_COMPLEX).find(firstHeaderCell);
};

const getMixedValuesCellResizer = () => {
    const firstHeaderCell =
        ".s-table-measure-column-header-group-cell-0.gd-mixed-values-column-header.gd-column-group-header--first .ag-header-cell-resize";
    return cy.get(TABLE_SELECTOR_STR_COMPLEX).find(firstHeaderCell);
};

export const getCallbackArray = () => {
    const callbackSelector = `.s-pivot-table-sizing-complex-callback`;
    const callbackContainer = cy.get(callbackSelector);

    return callbackContainer.then(function ($elem) {
        return JSON.parse($elem.text());
    });
};

export const getSliceMeasureColumnWidthItemByLocator = (data: any, measureIdentifier: string) => {
    return data.find((item: any) => {
        if (item.sliceMeasureColumnWidthItem?.locators) {
            return (
                item.sliceMeasureColumnWidthItem.locators[0].measureLocatorItem.measureIdentifier ===
                measureIdentifier
            );
        }
        return false;
    });
};

export const getMixedValuesColumnWidthItemByLocator = (data: any, measureIdentifier: string) => {
    return data.find((item: any) => {
        if (item.mixedValuesColumnWidthItem?.locators) {
            return (
                item.mixedValuesColumnWidthItem.locators[0].measureLocatorItem.measureIdentifier ===
                measureIdentifier
            );
        }
        return false;
    });
};

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip(
    "Transposed Pivot Table Sizing and Reset by double click",
    { tags: ["pre-merge_isolated_bear"] },
    () => {
        beforeEach(() => {
            visit("visualizations/pivot-table/sizing/pivot-table-transposed-complex-reset");
        });

        it("should set slice measure column with provided width and notify column as manually resized via props", () => {
            const expectedCallBackArrayItemsCount = 1;

            const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
            table.waitLoaded();

            // set slice measure manual size
            clickItem(CHANGE_WIDTH_BUTTON_SLICE_MEASURE_STR);

            table.waitLoaded();

            //check slice measure col size
            table.hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false);

            // check callback length
            const callbackArray = getCallbackArray();
            callbackArray.should("have.length", expectedCallBackArrayItemsCount);

            callbackArray.then((arr) => {
                const item = getSliceMeasureColumnWidthItemByLocator(arr, MEASURE_LOCATOR_ITEM);
                // it should have AttributeColumnWidthItem
                cy.wrap(item).should("not.equal", undefined);
                // it should have correct width
                checkWidthWithTolerance(
                    cy.wrap(item.sliceMeasureColumnWidthItem.width.value),
                    SECOND_CELL_MANUAL_WIDTH,
                );
            });
        });

        it("should set mixed values column with provided width and notify column as manually resized via props", () => {
            const expectedCallBackArrayItemsCount = 1;

            const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
            table.waitLoaded();

            // set slice measure manual size
            clickItem(CHANGE_WIDTH_BUTTON_MIXED_VALUE_STR);

            table.waitLoaded();

            //check slice measure col size
            table.hasCellWidth(0, 2, FIRST_CELL_MANUAL_WIDTH, false);

            // check callback length
            const callbackArray = getCallbackArray();
            callbackArray.should("have.length", expectedCallBackArrayItemsCount);

            callbackArray.then((arr) => {
                const item = getMixedValuesColumnWidthItemByLocator(arr, MEASURE_LOCATOR_ITEM);
                // it should have AttributeColumnWidthItem
                cy.wrap(item).should("not.equal", undefined);
                // it should have correct width
                checkWidthWithTolerance(
                    cy.wrap(item.mixedValuesColumnWidthItem.width.value),
                    FIRST_CELL_MANUAL_WIDTH,
                );
            });
        });

        it("should reset slice measure column with default width by double click to auto size and notify column as manually resized via props", () => {
            const expectedCallBackArrayItemsCount = 1;

            const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
            table.waitLoaded();

            //check size before
            table.hasCellWidth(0, 1, CELL_DEFAULT_WIDTH, false);

            //do reset
            const firstResizer = getSliceMeasureCellResizer();
            firstResizer.dblclick();

            cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

            //check size after reset
            table.hasCellWidth(0, 1, FIRST_SLICE_MEASURE_CELL_AUTORESIZE_WIDTH, true);

            //check callback length
            const callbackArray = getCallbackArray();
            callbackArray.should("have.length", expectedCallBackArrayItemsCount);

            callbackArray.then((arr) => {
                const item = getSliceMeasureColumnWidthItemByLocator(arr, MEASURE_LOCATOR_ITEM);
                // it should have AttributeColumnWidthItem
                cy.wrap(item).should("not.equal", undefined);
                // it should have correct width
                checkWidthWithTolerance(
                    cy.wrap(item.sliceMeasureColumnWidthItem.width.value),
                    FIRST_SLICE_MEASURE_CELL_AUTORESIZE_WIDTH,
                );
            });
        });

        it("should reset mixed values measure column with default width by double click to auto size and notify column as manually resized via props", () => {
            const expectedCallBackArrayItemsCount = 1;

            const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
            table.waitLoaded();

            //check size before
            table.hasCellWidth(0, 2, CELL_DEFAULT_WIDTH, false);

            //do reset
            const firstResizer = getMixedValuesCellResizer();
            firstResizer.dblclick();

            cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

            //check size after reset
            table.hasCellWidth(0, 2, FIRST_MIXED_VALUES_CELL_AUTORESIZE_WIDTH, true);

            //check callback length
            const callbackArray = getCallbackArray();
            callbackArray.should("have.length", expectedCallBackArrayItemsCount);

            callbackArray.then((arr) => {
                const item = getMixedValuesColumnWidthItemByLocator(arr, MEASURE_LOCATOR_ITEM);
                // it should have AttributeColumnWidthItem
                cy.wrap(item).should("not.equal", undefined);
                // it should have correct width
                checkWidthWithTolerance(
                    cy.wrap(item.mixedValuesColumnWidthItem.width.value),
                    FIRST_MIXED_VALUES_CELL_AUTORESIZE_WIDTH,
                );
            });
        });

        it("when auto resize is on should reset slice measure and mixed values column with manual width by double click to auto size and remove this column from manually resized via props", () => {
            const expectedCallBackArrayItemsCount = 0;

            const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
            table.waitLoaded();

            // set slice measure manual size
            clickItem(CHANGE_WIDTH_BUTTON_SLICE_MEASURE_STR);

            // set mixed value manual size
            clickItem(CHANGE_WIDTH_BUTTON_MIXED_VALUE_STR);

            // set auto size
            clickItem(TURN_ON_AUTO_SIZE_COMPLEX);

            table.waitLoaded();

            //check slice measure col size before
            table.hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false);
            //check mixed values col size before
            table.hasCellWidth(0, 2, FIRST_CELL_MANUAL_WIDTH, false);

            //do reset
            const sliceMeasureResizer = getSliceMeasureCellResizer();
            sliceMeasureResizer.dblclick();

            cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

            const mixedValuesResizer = getMixedValuesCellResizer();
            mixedValuesResizer.dblclick();

            cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

            //check slice measure col size after reset
            table.hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, true);
            //check mixed values col size after reset
            table.hasCellWidth(0, 2, SECOND_CELL_AUTORESIZE_WIDTH, true);

            //check callback
            const callbackArray = getCallbackArray();
            //check callback length
            callbackArray.should("have.length", expectedCallBackArrayItemsCount);
        });
    },
);

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("Transposed Pivot Table resizing", { tags: ["checklist_integrated_bear"] }, () => {
    const SIZE_AFTER_GROW_FIT = TOTAL_SIZE / 3;
    const SIZE_AFTER_CHANGE_1_COL = (TOTAL_SIZE - SECOND_CELL_MANUAL_WIDTH) / 2;
    const SIZE_AFTER_CHANGE_2_COL = TOTAL_SIZE - SECOND_CELL_MANUAL_WIDTH - FIRST_CELL_MANUAL_WIDTH;

    const table = new Table(TABLE_SELECTOR_STR_COMPLEX);

    beforeEach(() => {
        visit("visualizations/pivot-table/sizing/pivot-table-transposed-complex-reset");
        table.waitLoaded();
    });

    it("with autoSizing and growToFit are both off", () => {
        clickItem(CHANGE_WIDTH_BUTTON_SLICE_MEASURE_STR);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, CELL_DEFAULT_WIDTH, false)
            .hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false)
            .hasCellWidth(0, 2, CELL_DEFAULT_WIDTH, false);

        clickItem(CHANGE_WIDTH_BUTTON_MIXED_VALUE_STR);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, CELL_DEFAULT_WIDTH, false)
            .hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false)
            .hasCellWidth(0, 2, FIRST_CELL_MANUAL_WIDTH, false);
    });

    it("with autoSizing is off and growToFit is on", () => {
        clickItem(TURN_ON_GROW_TO_FIT_COMPLEX);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, SIZE_AFTER_GROW_FIT, true)
            .hasCellWidth(0, 1, SIZE_AFTER_GROW_FIT, true)
            .hasCellWidth(0, 2, SIZE_AFTER_GROW_FIT, true);

        clickItem(CHANGE_WIDTH_BUTTON_SLICE_MEASURE_STR);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, SIZE_AFTER_CHANGE_1_COL, false)
            .hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false)
            .hasCellWidth(0, 2, SIZE_AFTER_CHANGE_1_COL, false);

        clickItem(CHANGE_WIDTH_BUTTON_MIXED_VALUE_STR);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, SIZE_AFTER_CHANGE_2_COL, false)
            .hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false)
            .hasCellWidth(0, 2, FIRST_CELL_MANUAL_WIDTH, false);
    });

    it("with autoSizing is on and growToFit is off", () => {
        clickItem(TURN_ON_AUTO_SIZE_COMPLEX);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, 100, true)
            .hasCellWidth(0, 1, 68, true)
            .hasCellWidth(0, 2, 110, true);

        clickItem(CHANGE_WIDTH_BUTTON_SLICE_MEASURE_STR);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, 100, true)
            .hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false)
            .hasCellWidth(0, 2, 110, true);

        clickItem(CHANGE_WIDTH_BUTTON_MIXED_VALUE_STR);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, 100, true)
            .hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false)
            .hasCellWidth(0, 2, FIRST_CELL_MANUAL_WIDTH, false);
    });

    it("with autoSizing and growToFit are both on", () => {
        clickItem(TURN_ON_AUTO_SIZE_COMPLEX);
        clickItem(TURN_ON_GROW_TO_FIT_COMPLEX);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, 363, true)
            .hasCellWidth(0, 1, 245, true)
            .hasCellWidth(0, 2, 392, true);

        clickItem(CHANGE_WIDTH_BUTTON_SLICE_MEASURE_STR);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, 452, true)
            .hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false)
            .hasCellWidth(0, 2, 488, true);

        clickItem(CHANGE_WIDTH_BUTTON_MIXED_VALUE_STR);
        table
            .waitLoaded()
            .hasCellWidth(0, 0, SIZE_AFTER_CHANGE_2_COL, false)
            .hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false)
            .hasCellWidth(0, 2, FIRST_CELL_MANUAL_WIDTH, false);
    });
});
