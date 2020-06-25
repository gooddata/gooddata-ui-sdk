// (C) 2007-2020 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { Identifier, IMeasureLocatorItem } from "@gooddata/sdk-model";

export type ColumnWidthItem = IAttributeColumnWidthItem | IMeasureColumnWidthItem;
export type ColumnWidth = number;
export interface IAttributeColumnWidthItem {
    attributeColumnWidthItem: {
        width: ColumnWidth;
        attributeIdentifier: Identifier;
    };
}

export interface IMeasureColumnWidthItem {
    measureColumnWidthItem: {
        width: ColumnWidth;
        locators: LocatorItem[];
    };
}

// TODO: rename / alias types & add type guards
type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;
interface IAttributeLocatorItem {
    attributeLocatorItem: {
        attributeIdentifier: Identifier;
        element?: string; // this is difference from AFM.IAttributeLocatorItem
    };
}

export function isAttributeColumnWidthItem(
    columnWidthItem: ColumnWidthItem,
): columnWidthItem is IAttributeColumnWidthItem {
    return (
        !isEmpty(columnWidthItem) &&
        (columnWidthItem as IAttributeColumnWidthItem).attributeColumnWidthItem !== undefined
    );
}

export function isMeasureColumnWidthItem(
    columnWidthItem: ColumnWidthItem,
): columnWidthItem is IMeasureColumnWidthItem {
    return (
        !isEmpty(columnWidthItem) &&
        (columnWidthItem as IMeasureColumnWidthItem).measureColumnWidthItem !== undefined
    );
}

// TODO: add factory functions
