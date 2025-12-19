// (C) 2022-2025 GoodData Corporation

import { type MutableRefObject } from "react";

import { type Column, type ColumnResizedEvent } from "ag-grid-community";
import { InvariantError, invariant } from "ts-invariant";

import { type IAttributeOrMeasure, type IMeasure, isAttribute, isMeasure } from "@gooddata/sdk-model";

import { type ResizingState } from "./privateTypes.js";
import {
    ColumnEventSourceType,
    type IRepeaterAttributeColumnLocator,
    type IRepeaterAttributeColumnWidthItem,
    type IRepeaterMeasureColumnLocator,
    type IRepeaterMeasureColumnWidthItem,
    type IRepeaterWeakMeasureColumnWidthItem,
    type RepeaterColumnWidth,
    type RepeaterColumnWidthItem,
} from "../columnWidths.js";

export function getColumnWidths(resizingState: ResizingState): RepeaterColumnWidthItem[] {
    const columnApi = resizingState.columnApi;

    if (!columnApi) {
        return [];
    }

    return [
        ...resizingState.manuallyResizedColumns.map((col: Column) => {
            const column = columnApi.getColumn(col.getColId());
            const item = getSizeItem(resizingState, column!);
            const sizeItem = getColumnWidthItem(item!, column!, {
                value: column!.getActualWidth(),
                //TODO: Grow to fit
                allowGrowToFit: false,
            });

            invariant(sizeItem, `unable to find size item by filed ${col.getColId()}`);

            return sizeItem;
        }),
    ];
}

function getSizeItem(resizingState: ResizingState, column: Column) {
    return resizingState.items.find((item) => {
        if (isMeasure(item)) {
            return item.measure.localIdentifier === column.getColDef().field;
        } else {
            return item.attribute.localIdentifier === column.getColDef().field;
        }
    });
}

function getColumnWidthItem(
    item: IAttributeOrMeasure,
    col: Column,
    width: RepeaterColumnWidth,
): RepeaterColumnWidthItem {
    if (isAttribute(item)) {
        const attributeIdentifier = item.attribute.localIdentifier;
        if (Number(width.value) === width.value) {
            return {
                attributeColumnWidthItem: {
                    width,
                    attributeIdentifier,
                },
            };
        } else {
            throw new InvariantError(
                `width value for attributeColumnWidthItem has to be number ${col.getColId()}`,
            );
        }
    }
    if (isMeasure(item)) {
        return {
            measureColumnWidthItem: {
                width,
                locators: [createMeasureLocator(item)],
            },
        };
    }

    throw new InvariantError(`could not find header matching ${col.getColId()}`);
}

function createMeasureLocator(measure: IMeasure): IRepeaterMeasureColumnLocator {
    return {
        measureLocatorItem: {
            measureIdentifier: measure.measure.localIdentifier,
        },
    };
}

//check

export function isManualResizing(columnEvent: ColumnResizedEvent): boolean {
    return columnEvent?.source === ColumnEventSourceType.UI_RESIZED && !!columnEvent.columns;
}

export function isAttributeColumnWidthItem(obj: any): obj is IRepeaterAttributeColumnWidthItem {
    return obj?.attributeColumnWidthItem !== undefined;
}

export function isMeasureColumnWidthItem(obj: any): obj is IRepeaterMeasureColumnWidthItem {
    return obj?.measureColumnWidthItem && obj?.measureColumnWidthItem.locators !== undefined;
}

export function isAttributeColumnLocator(obj: any): obj is IRepeaterAttributeColumnLocator {
    return obj?.attributeLocatorItem !== undefined;
}

export function isMeasureColumnLocator(obj: any): obj is IRepeaterMeasureColumnLocator {
    return obj?.measureLocatorItem !== undefined;
}

export function isWeakMeasureColumnWidthItem(obj: any): obj is IRepeaterWeakMeasureColumnWidthItem {
    return obj?.measureColumnWidthItem && obj?.measureColumnWidthItem.locator !== undefined;
}

export function getManualResizedColumn(resizingState: MutableRefObject<ResizingState>, column: Column) {
    return (
        resizingState.current.manuallyResizedColumns.find(
            (manuallyResizedColumn) => manuallyResizedColumn.getColId() === column.getColId(),
        ) ?? null
    );
}
