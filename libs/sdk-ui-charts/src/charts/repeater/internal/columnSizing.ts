// (C) 2022-2024 GoodData Corporation

import { invariant, InvariantError } from "ts-invariant";
import { Column } from "@ag-grid-community/all-modules";
import { IAttributeOrMeasure, IMeasure, isMeasure, isAttribute } from "@gooddata/sdk-model";

import {
    RepeaterColumnWidthItem,
    RepeaterColumnWidth,
    IRepeaterMeasureColumnLocator,
} from "../columnWidths.js";
import { ResizingState } from "./privateTypes.js";

export function getColumnWidths(resizingState: ResizingState): RepeaterColumnWidthItem[] {
    const columnApi = resizingState.columnApi;

    if (!columnApi) {
        return [];
    }

    return [
        ...resizingState.manuallyResizedColumns.map((col: Column) => {
            const column = columnApi.getColumn(col.getColId());
            const item = getSizeItem(resizingState, column);
            const sizeItem = getColumnWidthItem(item, column, {
                value: column.getActualWidth(),
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
