// (C) 2025 GoodData Corporation
import { isEqual } from "lodash-es";

import {
    ColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    isMixedValuesColumnWidthItem,
    isSliceMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
} from "../../types/resizing.js";

/**
 * Returns true if the provided {@link ColumnWidthItem}s match by locators / identifiers.
 *
 * @internal
 */
export function isColumnWidthItemMatch(
    columnWidthItem1: ColumnWidthItem,
    columnWidthItem2: ColumnWidthItem,
): boolean {
    if (isAttributeColumnWidthItem(columnWidthItem1) && isAttributeColumnWidthItem(columnWidthItem2)) {
        return (
            columnWidthItem1.attributeColumnWidthItem.attributeIdentifier ===
            columnWidthItem2.attributeColumnWidthItem.attributeIdentifier
        );
    }

    if (isWeakMeasureColumnWidthItem(columnWidthItem1) && isWeakMeasureColumnWidthItem(columnWidthItem2)) {
        return (
            columnWidthItem1.measureColumnWidthItem.locator.measureLocatorItem.measureIdentifier ===
            columnWidthItem2.measureColumnWidthItem.locator.measureLocatorItem.measureIdentifier
        );
    }

    if (isMeasureColumnWidthItem(columnWidthItem1) && isMeasureColumnWidthItem(columnWidthItem2)) {
        return isEqual(
            columnWidthItem1.measureColumnWidthItem.locators,
            columnWidthItem2.measureColumnWidthItem.locators,
        );
    }

    if (isSliceMeasureColumnWidthItem(columnWidthItem1) && isSliceMeasureColumnWidthItem(columnWidthItem2)) {
        return isEqual(
            columnWidthItem1.sliceMeasureColumnWidthItem.locators,
            columnWidthItem2.sliceMeasureColumnWidthItem.locators,
        );
    }

    if (isMixedValuesColumnWidthItem(columnWidthItem1) && isMixedValuesColumnWidthItem(columnWidthItem2)) {
        return isEqual(
            columnWidthItem1.mixedValuesColumnWidthItem.locators,
            columnWidthItem2.mixedValuesColumnWidthItem.locators,
        );
    }

    return false;
}
