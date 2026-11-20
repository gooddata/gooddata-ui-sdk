// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent } from "react";

import { type ObjRef, objRefToString } from "@gooddata/sdk-model";

import { type IUiAsyncTableColumn, type IUiAsyncTableFilterOption } from "../types.js";

import {
    ASYNC_TABLE_ID_PREFIX,
    CHECKBOX_COLUMN_WIDTH,
    MENU_COLUMN_WIDTH,
    MENU_COLUMN_WIDTH_LARGE,
} from "./constants.js";

export const getColumnWidth = (renderMenu: boolean, isLarge: boolean, widthProp?: number) => {
    return renderMenu ? (isLarge ? MENU_COLUMN_WIDTH_LARGE : MENU_COLUMN_WIDTH) : widthProp;
};

export const getItemKey = <T extends { id: string } | { ref: ObjRef }>(item: T): string => {
    if ("id" in item) {
        return (item as { id: string }).id;
    }
    return objRefToString((item as { ref: ObjRef }).ref);
};

export const getColumnWidths = <T extends { id: string } | { ref: ObjRef }>(
    columns: IUiAsyncTableColumn<T>[],
    hasCheckbox: boolean,
    isLargeRow: boolean,
) => {
    const columnWidths = columns.map((col) => getColumnWidth(!!col.renderMenu, isLargeRow, col.width));
    return hasCheckbox ? [CHECKBOX_COLUMN_WIDTH, ...columnWidths] : columnWidths;
};

export const getFilterOptionsMap = (options: Array<IUiAsyncTableFilterOption>) => {
    return new Map(options.map((item) => [item.value, item]));
};

export const getColumnHeaderId = (key: string) => {
    return `${ASYNC_TABLE_ID_PREFIX}column-header-${key}`;
};

export const getRowLabelId = (tableId: string, key: number) => {
    return `${ASYNC_TABLE_ID_PREFIX}${tableId}-label-cell-row-${key}`;
};

export const getRowId = (tableId: string, itemId: string) => {
    return `${ASYNC_TABLE_ID_PREFIX}${tableId}-row-${itemId}`;
};

export const getCellId = (tableId: string, itemId: string, columnIndex: number) => {
    return `${ASYNC_TABLE_ID_PREFIX}${tableId}-cell-${itemId}-${columnIndex}`;
};

const EDITABLE_HOST_SELECTOR = "[contenteditable]:not([contenteditable='false'])";

const CELL_CONTROLS_SELECTOR = `a[href], button, input, select, textarea, [tabindex], ${EDITABLE_HOST_SELECTOR}`;

const FOCUS_TO_OPERATE_SELECTOR = [
    "textarea",
    "select",
    "[role='slider']",
    "[role='spinbutton']",
    "[role='textbox']",
    "[role='searchbox']",
    "[role='combobox']",
    "[role='listbox']",
    EDITABLE_HOST_SELECTOR,
    "input:not([type='button']):not([type='checkbox']):not([type='radio']):not([type='submit'])" +
        ":not([type='reset']):not([type='image']):not([type='file']):not([type='color'])" +
        ":not([type='hidden'])",
].join(", ");

const isRendered = (control: Element): boolean =>
    (control as HTMLElement).checkVisibility?.({ visibilityProperty: true }) ?? true;

const isDisabledByFieldset = (control: HTMLElement): boolean => {
    if (control.matches(":disabled")) {
        return true;
    }
    if (!control.matches("button, input, select, textarea")) {
        return false;
    }
    let fieldset = control.closest("fieldset[disabled]");
    while (fieldset) {
        const legend = Array.from(fieldset.children).find((child) => child.tagName === "LEGEND");
        if (!legend?.contains(control)) {
            return true;
        }
        fieldset = fieldset.parentElement?.closest("fieldset[disabled]") ?? null;
    }
    return false;
};

export const getCellControls = (cell: HTMLElement): HTMLElement[] =>
    Array.from(cell.querySelectorAll<HTMLElement>(CELL_CONTROLS_SELECTOR)).filter(
        (control) =>
            !control.hasAttribute("disabled") &&
            !isDisabledByFieldset(control) &&
            !control.closest("[aria-disabled='true']") &&
            !control.matches("input[type='hidden']") &&
            !control.closest("[hidden], [aria-hidden='true'], [inert]") &&
            isRendered(control),
    );

export const isFromCellControl = (cell: HTMLElement, target: HTMLElement): boolean => {
    const control = target.closest(CELL_CONTROLS_SELECTOR);
    return !!control && cell.contains(control);
};

const hasContentBesidesControl = (cell: HTMLElement, control: HTMLElement): boolean => {
    const walker = cell.ownerDocument.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (
            parent &&
            !control.contains(node) &&
            (node.textContent ?? "").trim() !== "" &&
            !parent.closest("[hidden]") &&
            isRendered(parent)
        ) {
            return true;
        }
    }
    return false;
};

const needsFocusToOperate = (control: HTMLElement): boolean =>
    !(control instanceof HTMLElement) || control.matches(FOCUS_TO_OPERATE_SELECTOR);

export const getSoleCellControl = (cell: HTMLElement): HTMLElement | undefined => {
    const controls = getCellControls(cell);
    return controls.length === 1 &&
        !needsFocusToOperate(controls[0]) &&
        !hasContentBesidesControl(cell, controls[0])
        ? controls[0]
        : undefined;
};

export const isInteractionModeCell = (cell: HTMLElement): boolean => {
    const controls = getCellControls(cell);
    return (
        controls.length > 1 ||
        (controls.length === 1 &&
            (needsFocusToOperate(controls[0]) || hasContentBesidesControl(cell, controls[0])))
    );
};

export const getFilterDropdownId = (label: string) => {
    return `${ASYNC_TABLE_ID_PREFIX}filter-dropdown-${label}`;
};
export const stopPropagationCallback = <T extends HTMLElement>(
    event: MouseEvent<T> | KeyboardEvent<T>,
    callback?: () => void,
): void => {
    event.stopPropagation();
    callback?.();
};

export const computeProportionalWidth = (
    originalColumnWidth: number,
    availableWidth: number,
    columnsWidthSum: number,
) => {
    if (columnsWidthSum === 0) {
        return originalColumnWidth;
    }
    const ratio = originalColumnWidth / columnsWidthSum;
    return Math.floor(availableWidth * ratio);
};
