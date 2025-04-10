// (C) 2022-2025 GoodData Corporation

import { attributeLocalId } from "@gooddata/sdk-model";
import * as Md from "../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

const TABLE_SELECTOR_STR_COMPLEX = ".s-pivot-table-sizing-complex";
const CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR = ".s-change-width-button-attribute";
const ADD_ALL_MEASURE_WIDTH_BUTTON = ".s-change-width-button-measure-all";
const TURN_ON_GROW_TO_FIT_COMPLEX = ".s-pivot-table-sizing-complex-grow-to-fit-checkbox";
const TURN_ON_AUTO_SIZE_COMPLEX = ".s-pivot-table-sizing-complex-autoresize-checkbox";

const FIRST_CELL_AUTORESIZE_WIDTH = 105;
const SECOND_CELL_AUTORESIZE_WIDTH = 110;
const SECOND_CELL_MANUAL_WIDTH = 60;
const SECOND_CELL_GROW_TO_FIT_WIDTH = 288;
const AG_GRID_ON_RESIZE_TIMEOUT = 500;
const CELL_DEFAULT_WIDTH = 200;
const FIRST_CELL_MANUAL_WIDTH = 400;
const AUTO_SIZE_TOLERANCE = 10;

const ATTRIBUTE_IDENTIFIER = attributeLocalId(Md.Product.Name);

export const getCallbackArray = () => {
    const callbackSelector = `.s-pivot-table-sizing-complex-callback`;
    const callbackContainer = cy.get(callbackSelector);

    return callbackContainer.then(function ($elem) {
        return JSON.parse($elem.text());
    });
};

export const getAttributeColumnWidthItemByIdentifier = (data: any, attributeIdentifier: string) => {
    return data.find((item: any) => {
        if (item.attributeColumnWidthItem) {
            return item.attributeColumnWidthItem.attributeIdentifier === attributeIdentifier;
        }
        return false;
    });
};

export const getMeasureColumnWidthItemByLocator = (
    data: any,
    measureIdentifier: string,
    attributeIdentifier: string,
    element: any,
) => {
    return data.find((item: any) => {
        if (item.measureColumnWidthItem?.locators) {
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

export const getAllMeasureColumnWidth = (data: any) => {
    return data.find((item: any) => {
        return !!(item.measureColumnWidthItem && !item.measureColumnWidthItem.locators);
    });
};

const getFirstCellResizer = () => {
    const firstHeaderCell = `.s-table-measure-column-header-group-cell-0.gd-column-group-header--first .ag-header-cell-resize`;
    return cy.get(TABLE_SELECTOR_STR_COMPLEX).find(firstHeaderCell);
};

const getSecondCellResizer = () => {
    const firstHeaderCell = `.s-table-measure-column-header-group-cell-0.s-table-measure-column-header-index-1 .ag-header-cell-resize`;
    return cy.get(TABLE_SELECTOR_STR_COMPLEX).find(firstHeaderCell);
};

const clickItem = (buttonSelector: string) => {
    cy.get(buttonSelector).click();
};

const checkWidthWithTolerance = (width: Cypress.Chainable<JQuery<number>>, expectedWidth: number) => {
    width
        .should("be.greaterThan", expectedWidth - AUTO_SIZE_TOLERANCE)
        .should("be.lessThan", expectedWidth + AUTO_SIZE_TOLERANCE);
};

// first attribute column

describe("Pivot Table Sizing and Reset by double click", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("visualizations/pivot-table/sizing/pivot-table-complex-reset");
    });

    it("should reset first column with default width by double click to auto size and notify column as manually resized via props", () => {
        const expectedCallBackArrayItemsCount = 1;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        //check size before
        table.hasCellWidth(0, 0, CELL_DEFAULT_WIDTH, false);

        //do reset
        const firstResizer = getFirstCellResizer();
        firstResizer.dblclick();

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        //check size after reset
        table.hasCellWidth(0, 0, FIRST_CELL_AUTORESIZE_WIDTH, true);

        //check callback length
        const callbackArray = getCallbackArray();
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getAttributeColumnWidthItemByIdentifier(arr, ATTRIBUTE_IDENTIFIER);
            // it should has AttributeColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);
            // it should has correct width
            checkWidthWithTolerance(
                cy.wrap(item.attributeColumnWidthItem.width.value),
                FIRST_CELL_AUTORESIZE_WIDTH,
            );
        });
    });

    it("should change first column with manual width by double click to auto size and notify column as manually resized via props", () => {
        const expectedCallBackArrayItemsCount = 1;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        // set manual size
        clickItem(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);

        //check size before
        table.hasCellWidth(0, 0, FIRST_CELL_MANUAL_WIDTH, false);

        //do reset
        const firstResizer = getFirstCellResizer();
        firstResizer.dblclick();

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        //check size after reset
        table.hasCellWidth(0, 0, FIRST_CELL_AUTORESIZE_WIDTH, true);

        //check callback length
        const callbackArray = getCallbackArray();
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getAttributeColumnWidthItemByIdentifier(arr, ATTRIBUTE_IDENTIFIER);
            // it should have AttributeColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);
            // it should has correct width
            checkWidthWithTolerance(
                cy.wrap(item.attributeColumnWidthItem.width.value),
                FIRST_CELL_AUTORESIZE_WIDTH,
            );
        });
    });

    it("when auto resize is on should reset first column with manual width by double click to auto size and remove this column from manually resized via props", () => {
        const expectedCallBackArrayItemsCount = 0;
        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        // set manual size
        clickItem(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);

        //set auto size
        clickItem(TURN_ON_AUTO_SIZE_COMPLEX);
        table.waitLoaded();

        //check size before reset
        table.hasCellWidth(0, 0, FIRST_CELL_MANUAL_WIDTH, true);

        //do reset
        const firstResizer = getFirstCellResizer();
        firstResizer.dblclick();

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        //check size after reset
        table.hasCellWidth(0, 0, FIRST_CELL_AUTORESIZE_WIDTH, true);

        //check callback
        const callbackArray = getCallbackArray();
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);
    });

    // second measure column

    it("should remove all measure width when reset with metaKey and all measures columns should be auto sized", () => {
        const expectedCallBackArrayItemsCount = 2;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        // set manual size
        clickItem(ADD_ALL_MEASURE_WIDTH_BUTTON);

        //do manual reset
        const resizer = getSecondCellResizer();
        resizer.dblclick({ metaKey: true });

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        // after resize first cell
        table.hasCellWidth(0, 1, SECOND_CELL_AUTORESIZE_WIDTH, true);

        // check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getAllMeasureColumnWidth(arr);

            // it should have not MeasureColumnWidthItem
            cy.wrap(item).should("equal", undefined);
        });
    });

    it("should reset all measure columns and apply correctly grow to fit on them", () => {
        const expectedCallBackArrayItemsCount = 3;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        // set grow to fit
        clickItem(TURN_ON_GROW_TO_FIT_COMPLEX);
        table.waitLoaded();

        clickItem(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);
        clickItem(ADD_ALL_MEASURE_WIDTH_BUTTON);

        const resizer = getSecondCellResizer();
        resizer.dblclick({ metaKey: true });

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        // after reset
        table.hasCellWidth(0, 1, SECOND_CELL_GROW_TO_FIT_WIDTH, true);

        // check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getAllMeasureColumnWidth(arr);

            // it should have not MeasureColumnWidthItem
            cy.wrap(item).should("equal", undefined);
        });
    });

    it("should not reset all measure columns when double clicked with meta key on attribute resizer", () => {
        const expectedCallBackArrayItemsCount = 2;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        clickItem(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);
        clickItem(ADD_ALL_MEASURE_WIDTH_BUTTON);

        const resizer = getFirstCellResizer();
        resizer.dblclick({ metaKey: true });

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        // after reset check first attribute cell size
        table.hasCellWidth(0, 0, FIRST_CELL_AUTORESIZE_WIDTH, true);

        // after reset check second measure cell size
        table.hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, true);

        // check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getAllMeasureColumnWidth(arr);

            // it should have MeasureColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);

            // it should has correct width
            checkWidthWithTolerance(
                cy.wrap(item.measureColumnWidthItem.width.value),
                SECOND_CELL_MANUAL_WIDTH,
            );
        });
    });

    it("should not reset all measure columns when double clicked with alt key on attribute resizer", () => {
        const expectedCallBackArrayItemsCount = 2;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        clickItem(CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR);
        clickItem(ADD_ALL_MEASURE_WIDTH_BUTTON);

        const resizer = getFirstCellResizer();
        resizer.dblclick({ altKey: true });

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        // after reset check first attribute cell size
        table.hasCellWidth(0, 0, FIRST_CELL_AUTORESIZE_WIDTH, true);

        // after reset check second measure cell size
        table.hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, true);

        // check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);
        // check callback
        callbackArray.then((arr) => {
            const item = getAllMeasureColumnWidth(arr);

            // it should have MeasureColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);

            // it should has correct width
            checkWidthWithTolerance(
                cy.wrap(item.measureColumnWidthItem.width.value),
                SECOND_CELL_MANUAL_WIDTH,
            );
        });
    });
});
