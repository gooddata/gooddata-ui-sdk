// (C) 2022 GoodData Corporation
import { attributeLocalId, measureLocalId } from "@gooddata/sdk-model";
import * as Md from "../../../scenarios/src/md/full";
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const constants = require("../../constants");

const TABLE_SELECTOR_STR_COMPLEX = ".s-pivot-table-sizing-complex";
const CHANGE_WIDTH_BUTTON_ATTRIBUTE_STR = ".s-change-width-button-attribute";
const CHANGE_WIDTH_BUTTON_MEASURE_STR = ".s-change-width-button-measure";
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
const MEASURE_LOCATOR_ITEM = measureLocalId(Md.Amount);
const ATTRIBUTE_LOCATOR_ITEM_ATT_ID = attributeLocalId(Md.Region);

// rep from workspace variable
const ATTRIBUTE_LOCATOR_ITEM_ATT_ELM = `/gdc/md/${constants.WORKSPACE_ID}/obj/1083/elements?id=460488`;

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

const dragResizer = (
    resizer: Cypress.Chainable<JQuery<HTMLElement>>,
    dragOffset: number,
    metaKey: boolean,
    altKey: boolean,
) => {
    resizer.dragByOffset({ x: dragOffset }, metaKey, altKey);
};

const checkWidthWithTolerance = (width: Cypress.Chainable<JQuery<number>>, expectedWidth: number) => {
    width
        .should("be.greaterThan", expectedWidth - AUTO_SIZE_TOLERANCE)
        .should("be.lessThan", expectedWidth + AUTO_SIZE_TOLERANCE);
};

// first attribute column

describe("Pivot Table Sizing and Reset by double click", () => {
    beforeEach(() => {
        cy.login();
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

    it("should resize first column by DnD and notify column as manually resized via props", () => {
        const expectedCallBackArrayItemsCount = 1;
        const dragOffset = 100;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        //check size before
        table.hasCellWidth(0, 0, CELL_DEFAULT_WIDTH, false);

        //do manual resize via DnD
        const firstResizer = getFirstCellResizer();
        dragResizer(firstResizer, dragOffset, false, false);

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        //check size after drag
        table.hasCellWidth(0, 0, CELL_DEFAULT_WIDTH + dragOffset, true);

        //check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getAttributeColumnWidthItemByIdentifier(arr, ATTRIBUTE_IDENTIFIER);

            // it should have AttributeColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);
            // it should has correct width
            checkWidthWithTolerance(
                cy.wrap(item.attributeColumnWidthItem.width.value),
                CELL_DEFAULT_WIDTH + dragOffset,
            );
        });
    });

    // second measure column

    it("should reset second column with default width by double click to auto size and notify column as manually resized via props", () => {
        const expectedCallBackArrayItemsCount = 1;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        //check size before
        table.hasCellWidth(0, 1, CELL_DEFAULT_WIDTH, false);

        //do reset
        const resizer = getSecondCellResizer();
        resizer.dblclick();

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        //check size after reset
        table.hasCellWidth(0, 1, SECOND_CELL_AUTORESIZE_WIDTH, true);

        //check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getMeasureColumnWidthItemByLocator(
                arr,
                MEASURE_LOCATOR_ITEM,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
            );

            // it should have MeasureColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);

            // it should has correct width
            checkWidthWithTolerance(
                cy.wrap(item.measureColumnWidthItem.width.value),
                SECOND_CELL_AUTORESIZE_WIDTH,
            );
        });
    });

    it("should reset second column with manual width by double click to auto size and notify column as manually resized via props", () => {
        const expectedCallBackArrayItemsCount = 1;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        // set manual size
        clickItem(CHANGE_WIDTH_BUTTON_MEASURE_STR);

        //check size before
        table.hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false);

        //do reset
        const resizer = getSecondCellResizer();
        resizer.dblclick();

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        //check size after reset
        table.hasCellWidth(0, 1, SECOND_CELL_AUTORESIZE_WIDTH, true);

        //check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getMeasureColumnWidthItemByLocator(
                arr,
                MEASURE_LOCATOR_ITEM,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
            );

            // it should have MeasureColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);
            // it should has correct width
            checkWidthWithTolerance(
                cy.wrap(item.measureColumnWidthItem.width.value),
                SECOND_CELL_AUTORESIZE_WIDTH,
            );
        });
    });

    it("when auto resize is on should reset second column with manual width by double click to auto size and remove this column from manually resized via props", () => {
        const expectedCallBackArrayItemsCount = 0;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        // set manual size
        clickItem(CHANGE_WIDTH_BUTTON_MEASURE_STR);

        // set auto size
        clickItem(TURN_ON_AUTO_SIZE_COMPLEX);

        table.waitLoaded();

        //check size before
        table.hasCellWidth(0, 1, SECOND_CELL_MANUAL_WIDTH, false);

        //do reset
        const resizer = getSecondCellResizer();
        resizer.dblclick();

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        //check size after reset
        table.hasCellWidth(0, 1, SECOND_CELL_AUTORESIZE_WIDTH, true);

        //check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);
    });

    it("should resize second column by DnD and notify column as manually resized via props", () => {
        const expectedCallBackArrayItemsCount = 1;
        const dragOffset = 100;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        //check size before
        table.hasCellWidth(0, 1, CELL_DEFAULT_WIDTH, false);

        //do manual resize via DnD
        const resizer = getSecondCellResizer();
        dragResizer(resizer, dragOffset, false, false);

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        //check size after drag
        table.hasCellWidth(0, 1, CELL_DEFAULT_WIDTH + dragOffset, true);

        //check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getMeasureColumnWidthItemByLocator(
                arr,
                MEASURE_LOCATOR_ITEM,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
            );

            // it should have MeasureColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);
            // it should has correct width
            checkWidthWithTolerance(
                cy.wrap(item.measureColumnWidthItem.width.value),
                CELL_DEFAULT_WIDTH + dragOffset,
            );
        });
    });

    it("should resize second column by DnD while meta key pressed and resize all measure columns", () => {
        const expectedCallBackArrayItemsCount = 1;
        const dragOffset = -100;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        //check size before
        table.hasCellWidth(0, 1, CELL_DEFAULT_WIDTH, false);

        //do manual resize via DnD with meta key press
        const resizer = getSecondCellResizer();
        dragResizer(resizer, dragOffset, true, false);

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        // after resize first cell
        table.hasCellWidth(0, 1, CELL_DEFAULT_WIDTH + dragOffset, true);

        // after resize last cell
        table.hasCellWidth(0, 2, CELL_DEFAULT_WIDTH + dragOffset, true);

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
                CELL_DEFAULT_WIDTH + dragOffset,
            );
        });
    });

    it("should reset previously resized column with metaKey and notify column as manually resized via props", () => {
        const expectedCallBackArrayItemsCount = 2;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        // set manual size
        clickItem(ADD_ALL_MEASURE_WIDTH_BUTTON);

        //do manual reset
        const resizer = getSecondCellResizer();
        resizer.dblclick();

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        // after resize first cell
        table.hasCellWidth(0, 1, SECOND_CELL_AUTORESIZE_WIDTH, true);

        // check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getMeasureColumnWidthItemByLocator(
                arr,
                MEASURE_LOCATOR_ITEM,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
            );

            // it should have MeasureColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);
            // it should has correct width
            checkWidthWithTolerance(
                cy.wrap(item.measureColumnWidthItem.width.value),
                SECOND_CELL_AUTORESIZE_WIDTH,
            );
        });
    });

    it("when autosize on it should reset previously resized column with metaKey and notify column as manually resized via props with value auto", () => {
        const expectedCallBackArrayItemsCount = 2;

        const table = new Table(TABLE_SELECTOR_STR_COMPLEX);
        table.waitLoaded();

        // set manual size
        clickItem(ADD_ALL_MEASURE_WIDTH_BUTTON);

        // set auto size
        clickItem(TURN_ON_AUTO_SIZE_COMPLEX);
        table.waitLoaded();

        //do manual reset
        const resizer = getSecondCellResizer();
        resizer.dblclick();

        cy.wait(AG_GRID_ON_RESIZE_TIMEOUT);

        // after resize first cell
        table.hasCellWidth(0, 1, SECOND_CELL_AUTORESIZE_WIDTH, true);

        // check callback
        const callbackArray = getCallbackArray();
        //check callback length
        callbackArray.should("have.length", expectedCallBackArrayItemsCount);

        callbackArray.then((arr) => {
            const item = getMeasureColumnWidthItemByLocator(
                arr,
                MEASURE_LOCATOR_ITEM,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ID,
                ATTRIBUTE_LOCATOR_ITEM_ATT_ELM,
            );

            // it should have MeasureColumnWidthItem
            cy.wrap(item).should("not.equal", undefined);
            // it should has correct width
            cy.wrap(item.measureColumnWidthItem.width.value).should("equal", "auto");
        });
    });

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

    it("should reset all measaure columns and apply correctly grow to fit on them", () => {
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

    it("should not reset all measaure columns when doubleclicked with meta key on attribute resizer", () => {
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

    it("should not reset all measaure columns when doubleclicked with alt key on attribute resizer", () => {
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
