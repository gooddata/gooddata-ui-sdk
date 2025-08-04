// (C) 2025 GoodData Corporation
import {
    ColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    isMixedValuesColumnWidthItem,
    isSliceMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
} from "../../types/resizing.js";

/**
 * Returns the width value from the provided {@link ColumnWidthItem}.
 *
 * @internal
 */
export function getColumnWidthItemValue(columnWidthItem: ColumnWidthItem): number | undefined {
    if (isAttributeColumnWidthItem(columnWidthItem)) {
        return columnWidthItem.attributeColumnWidthItem.width.value;
    }

    if (isWeakMeasureColumnWidthItem(columnWidthItem)) {
        return columnWidthItem.measureColumnWidthItem.width.value;
    }

    if (isMeasureColumnWidthItem(columnWidthItem)) {
        return columnWidthItem.measureColumnWidthItem.width.value === "auto"
            ? undefined
            : columnWidthItem.measureColumnWidthItem.width.value;
    }

    if (isSliceMeasureColumnWidthItem(columnWidthItem)) {
        return columnWidthItem.sliceMeasureColumnWidthItem.width.value === "auto"
            ? undefined
            : columnWidthItem.sliceMeasureColumnWidthItem.width.value;
    }

    if (isMixedValuesColumnWidthItem(columnWidthItem)) {
        return columnWidthItem.mixedValuesColumnWidthItem.width.value === "auto"
            ? undefined
            : columnWidthItem.mixedValuesColumnWidthItem.width.value;
    }

    return undefined;
}
