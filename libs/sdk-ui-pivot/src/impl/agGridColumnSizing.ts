// (C) 2007-2020 GoodData Corporation
import invariant from "ts-invariant";
import omit = require("lodash/omit");
import partition = require("lodash/partition");
import {
    getAttributeLocators,
    getColumnIdentifier,
    getColumnIdentifierFromDef,
    getIdsFromUri,
    getLastFieldId,
    getLastFieldType,
    getParsedFields,
    getTreeLeaves,
    isMeasureColumn,
} from "./agGridUtils";
import { FIELD_SEPARATOR, FIELD_TYPE_ATTRIBUTE, FIELD_TYPE_MEASURE, ID_SEPARATOR } from "./agGridConst";
import { identifyResponseHeader } from "./agGridHeaders";

import { IGridHeader } from "./agGridTypes";
import { ColDef, Column, ColumnApi } from "@ag-grid-community/all-modules";
import {
    AbsoluteColumnWidth,
    ColumnWidth,
    ColumnWidthItem,
    IAllMeasureColumnWidthItem,
    IAttributeColumnWidthItem,
    IMeasureColumnWidthItem,
    isAbsoluteColumnWidth,
    isAllMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isColumnWidthAuto,
    isMeasureColumnWidthItem,
} from "../columnWidths";
import { ColumnEventSourceType, IResizedColumns, IResizedColumnsItem } from "../types";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { IAttributeDescriptor, IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import { isMeasureLocator } from "@gooddata/sdk-model";

export const MIN_WIDTH = 60;
export const AUTO_SIZED_MAX_WIDTH = 500;
export const MANUALLY_SIZED_MAX_WIDTH = 2000;

//
//
//

export interface IResizedColumnsCollection {
    [columnIdentifier: string]: IResizedColumnsCollectionItem;
}

export interface IResizedColumnsCollectionItem {
    width: ColumnWidth;
    source: ColumnEventSourceType;
}

export class ResizedColumnsStore {
    private manuallyResizedColumns: IResizedColumnsCollection;
    private allMeasureColumnWidth: number | null;

    public constructor() {
        this.manuallyResizedColumns = {};
        this.allMeasureColumnWidth = null;
    }

    public getManuallyResizedColumn(item: Column | ColDef): IResizedColumnsItem {
        const colId = getColumnIdentifier(item);

        if (this.manuallyResizedColumns[colId]) {
            return this.convertItem(this.manuallyResizedColumns[colId]);
        }

        if (isMeasureColumn(item) && this.isAllMeasureColumWidthUsed()) {
            return this.getAllMeasureColumMapItem();
        }
    }

    public isColumnManuallyResized(item: Column | ColDef) {
        return !!this.getManuallyResizedColumn(item);
    }

    public addToManuallyResizedColumn(column: Column): void {
        this.manuallyResizedColumns[getColumnIdentifier(column)] = {
            width: column.getActualWidth(),
            source: ColumnEventSourceType.UI_DRAGGED,
        };

        column.getColDef().suppressSizeToFit = true;
    }

    public addAllMeasureColumns(columnWidth: number, allColumns: Column[]) {
        this.allMeasureColumnWidth = columnWidth;
        allColumns.forEach((col) => {
            if (isMeasureColumn(col)) {
                const colId = getColumnIdentifier(col);
                if (this.manuallyResizedColumns[colId]) {
                    this.manuallyResizedColumns = omit(this.manuallyResizedColumns, colId);
                }
                col.getColDef().suppressSizeToFit = true;
            }
        });
    }

    public removeAllMeasureColumns() {
        this.allMeasureColumnWidth = null;
        const colIds = Object.keys(this.manuallyResizedColumns);
        colIds.forEach((colId) => {
            const item = this.manuallyResizedColumns[colId];
            if (isColumnWidthAuto(item.width)) {
                this.manuallyResizedColumns = omit(this.manuallyResizedColumns, colId);
            }
        });
    }

    public removeFromManuallyResizedColumn(column: Column): void {
        const colId = getColumnIdentifier(column);
        const item = this.manuallyResizedColumns[colId];

        if (item) {
            this.manuallyResizedColumns = omit(this.manuallyResizedColumns, colId);

            if (!this.isAllMeasureColumWidthUsed() || !isMeasureColumn(column)) {
                column.getColDef().suppressSizeToFit = false;
            }
        }

        if (this.isAllMeasureColumWidthUsed() && isMeasureColumn(column)) {
            this.manuallyResizedColumns[colId] = this.getAutoSizeItem();
            column.getColDef().suppressSizeToFit = false;
        }
    }

    public getColumnWidthsFromMap(dv: DataViewFacade): ColumnWidthItem[] {
        const result = getColumnWidthsFromMap(this.manuallyResizedColumns, dv);
        if (this.isAllMeasureColumWidthUsed()) {
            result.push(this.getAllMeasureColumnWidth());
        }
        return result;
    }

    public updateColumnWidths(columnWidths: ColumnWidthItem[], dv: DataViewFacade) {
        const [allMeasureColumnWidthItems, columnWidthItems] = partition(columnWidths, (item) =>
            isAllMeasureColumnWidthItem(item),
        );

        const allMeasureWidthItem = allMeasureColumnWidthItems[0];

        if (isAllMeasureColumnWidthItem(allMeasureWidthItem)) {
            const validatedWidth = defaultWidthValidator(allMeasureWidthItem.measureColumnWidthItem.width);
            this.allMeasureColumnWidth = isAbsoluteColumnWidth(validatedWidth) ? validatedWidth : null;
        } else {
            this.allMeasureColumnWidth = null;
        }

        const columnWidthsByField = convertColumnWidthsToMap(columnWidthItems, dv);
        this.manuallyResizedColumns = columnWidthsByField;
    }

    private convertItem(item: IResizedColumnsCollectionItem): IResizedColumnsItem {
        // columns with width = auto are hidden
        if (isAbsoluteColumnWidth(item.width)) {
            return {
                width: item.width,
                source: item.source,
            };
        }
    }

    private isAllMeasureColumWidthUsed() {
        return this.allMeasureColumnWidth !== null;
    }

    private getAutoSizeItem(): IResizedColumnsCollectionItem {
        return { width: "auto", source: ColumnEventSourceType.UI_DRAGGED };
    }

    private getAllMeasureColumMapItem(): IResizedColumnsItem {
        return { width: this.allMeasureColumnWidth, source: ColumnEventSourceType.UI_DRAGGED };
    }

    private getAllMeasureColumnWidth(): IAllMeasureColumnWidthItem {
        return {
            measureColumnWidthItem: {
                width: this.allMeasureColumnWidth,
            },
        };
    }
}

//
//
//

export const convertColumnWidthsToMap = (
    columnWidths: ColumnWidthItem[],
    dv: DataViewFacade,
    widthValidator: (width: ColumnWidth) => ColumnWidth = defaultWidthValidator,
): IResizedColumnsCollection => {
    if (!columnWidths) {
        return {};
    }
    const columnWidthsMap: IResizedColumnsCollection = {};
    const attributeDescriptors = dv.meta().attributeDescriptors();
    const measureDescriptors = dv.meta().measureDescriptors();

    columnWidths.forEach((columnWidth: ColumnWidthItem) => {
        if (isAttributeColumnWidthItem(columnWidth)) {
            const [field, width] = getAttributeColumnWidthItemFieldAndWidth(
                columnWidth,
                attributeDescriptors,
            );
            columnWidthsMap[field] = {
                width: widthValidator(width),
                source: ColumnEventSourceType.UI_DRAGGED,
            };
        }
        if (isMeasureColumnWidthItem(columnWidth)) {
            const [field, width] = getMeasureColumnWidthItemFieldAndWidth(columnWidth, measureDescriptors);
            columnWidthsMap[field] = {
                width: widthValidator(width),
                source: ColumnEventSourceType.UI_DRAGGED,
            };
        }
    });
    return columnWidthsMap;
};

const getAttributeColumnWidthItemFieldAndWidth = (
    columnWidthItem: IAttributeColumnWidthItem,
    attributeHeaders: IAttributeDescriptor[],
): [string, AbsoluteColumnWidth] => {
    const localIdentifier = columnWidthItem.attributeColumnWidthItem.attributeIdentifier;

    const attributeHeader = attributeHeaders.find(
        (header) => header.attributeHeader.localIdentifier === localIdentifier,
    );
    invariant(attributeHeader, `Could not find attributeHeader with localIdentifier "${localIdentifier}"`);

    const field = identifyResponseHeader(attributeHeader);
    return [field, columnWidthItem.attributeColumnWidthItem.width];
};

const getMeasureColumnWidthItemFieldAndWidth = (
    columnWidthItem: IMeasureColumnWidthItem,
    measureHeaderItems: IMeasureDescriptor[],
): [string, ColumnWidth] => {
    const keys: string[] = [];
    columnWidthItem.measureColumnWidthItem.locators.forEach((locator) => {
        if (isMeasureLocator(locator)) {
            const measureColumnWidthHeaderIndex = measureHeaderItems.findIndex(
                (measureHeaderItem) =>
                    measureHeaderItem.measureHeaderItem.localIdentifier ===
                    locator.measureLocatorItem.measureIdentifier,
            );
            invariant(
                measureColumnWidthHeaderIndex !== -1,
                `Could not find measureHeader with localIdentifier "${locator.measureLocatorItem.measureIdentifier}"`,
            );
            keys.push(`m${ID_SEPARATOR}${measureColumnWidthHeaderIndex}`);
        } else {
            const key = `a${ID_SEPARATOR}${getIdsFromUri(locator.attributeLocatorItem.element).join(
                ID_SEPARATOR,
            )}`;
            keys.push(key);
        }
    });
    const field = keys.join(FIELD_SEPARATOR); // check if keys is empty than *
    return [field, columnWidthItem.measureColumnWidthItem.width];
};

const getSizeItemByColId = (dv: DataViewFacade, colId: string, width: ColumnWidth): ColumnWidthItem => {
    const fields = getParsedFields(colId);
    const lastFieldType = getLastFieldType(fields);
    const lastFieldId = getLastFieldId(fields);

    if (lastFieldType === FIELD_TYPE_ATTRIBUTE) {
        const rowDescriptors = dv.meta().attributeDescriptorsForDim(0);
        for (const header of rowDescriptors) {
            if (getIdsFromUri(header.attributeHeader.uri)[0] === lastFieldId) {
                const attributeIdentifier = header.attributeHeader.localIdentifier;

                if (isAbsoluteColumnWidth(width)) {
                    return {
                        attributeColumnWidthItem: {
                            width,
                            attributeIdentifier,
                        },
                    };
                } else {
                    invariant(false, `width value for attributeColumnWidthItem has to be number ${colId}`);
                }
            }
        }
        // check only column attribute without measure
        const colDescriptors = dv.meta().attributeDescriptorsForDim(1);

        const EMPTY_MEASURE_FIELD: string[] = [];
        const attributeLocators = getAttributeLocators([...fields, EMPTY_MEASURE_FIELD], colDescriptors);
        if (attributeLocators) {
            return {
                measureColumnWidthItem: {
                    width,
                    locators: [...attributeLocators],
                },
            };
        }

        invariant(false, `could not find attribute header matching ${colId}`);
    } else if (lastFieldType === FIELD_TYPE_MEASURE) {
        const colDescriptors = dv.meta().attributeDescriptorsForDim(1);
        const measureDescriptors = dv.meta().measureDescriptors();
        const headerItem = measureDescriptors[parseInt(lastFieldId, 10)];
        const attributeLocators = getAttributeLocators(fields, colDescriptors);

        return {
            measureColumnWidthItem: {
                width,
                locators: [
                    ...attributeLocators,
                    {
                        measureLocatorItem: {
                            measureIdentifier: headerItem.measureHeaderItem.localIdentifier,
                        },
                    },
                ],
            },
        };
    }
    invariant(false, `could not find header matching ${colId}`);
};

export const getColumnWidthsFromMap = (
    map: IResizedColumnsCollection,
    dv: DataViewFacade,
): ColumnWidthItem[] => {
    return Object.keys(map).map((colId: string) => {
        const { width } = map[colId];
        const sizeItem = getSizeItemByColId(dv, colId, width);
        invariant(sizeItem, `unable to find size item by filed ${colId}`);
        return sizeItem;
    });
};

export const defaultWidthValidator = (width: ColumnWidth): ColumnWidth => {
    if (isAbsoluteColumnWidth(width)) {
        return Math.min(Math.max(width, MIN_WIDTH), MANUALLY_SIZED_MAX_WIDTH);
    }
    return width;
};

/**
 * This function _mutates_ the incoming column defs according to the sizing rules.
 */
export const updateColumnDefinitionsWithWidths = (
    columnDefinitions: IGridHeader[],
    resizedColumnsStore: ResizedColumnsStore,
    autoResizedColumns: IResizedColumns,
    defaultColumnWidth: AbsoluteColumnWidth,
    isGrowToFitEnabled: boolean,
    growToFittedColumns: IResizedColumns = {},
): void => {
    const leaves = getTreeLeaves(columnDefinitions);

    leaves.forEach((columnDefinition: IGridHeader) => {
        if (columnDefinition) {
            const columnId = getColumnIdentifierFromDef(columnDefinition);
            const manualSize = resizedColumnsStore.getManuallyResizedColumn(columnDefinition);
            const autoResizeSize = autoResizedColumns[columnId];

            columnDefinition.maxWidth = MANUALLY_SIZED_MAX_WIDTH;

            if (manualSize) {
                columnDefinition.width = manualSize.width;
                columnDefinition.suppressSizeToFit = true;
            } else {
                columnDefinition.suppressSizeToFit = false;
                columnDefinition.width = autoResizeSize ? autoResizeSize.width : defaultColumnWidth;
                if (isGrowToFitEnabled) {
                    const growToFittedColumn =
                        growToFittedColumns[getColumnIdentifierFromDef(columnDefinition)];

                    if (growToFittedColumn) {
                        columnDefinition.width = growToFittedColumn.width;
                        if (growToFittedColumn.width > MANUALLY_SIZED_MAX_WIDTH) {
                            columnDefinition.maxWidth = undefined;
                        }
                    }
                }
            }
        }
    });
};

export const syncSuppressSizeToFitOnColumns = (
    resizedColumnsStore: ResizedColumnsStore,
    columnApi: ColumnApi,
) => {
    if (!columnApi) {
        return;
    }

    const columns = columnApi.getAllColumns();

    columns.forEach((col) => {
        const resizedColumn = resizedColumnsStore.isColumnManuallyResized(col);
        resizedColumn
            ? (col.getColDef().suppressSizeToFit = true)
            : (col.getColDef().suppressSizeToFit = false);
    });
};

export const isColumnAutoResized = (autoResizedColumns: IResizedColumns, resizedColumnId: string) =>
    resizedColumnId && autoResizedColumns[resizedColumnId];

export const resetColumnsWidthToDefault = (
    columnApi: ColumnApi,
    columns: Column[],
    resizedColumnsStore: ResizedColumnsStore,
    autoResizedColumns: IResizedColumns,
    defaultWidth: number,
) => {
    columns.forEach((col) => {
        const id = getColumnIdentifier(col);

        if (resizedColumnsStore.isColumnManuallyResized(col)) {
            const manuallyResizedColumn = resizedColumnsStore.getManuallyResizedColumn(col);
            columnApi.setColumnWidth(col, manuallyResizedColumn.width);
        } else if (isColumnAutoResized(autoResizedColumns, id)) {
            columnApi.setColumnWidth(col, autoResizedColumns[id].width);
        } else {
            columnApi.setColumnWidth(col, defaultWidth);
        }
    });
};

export const resizeAllMeasuresColumns = (
    columnApi: ColumnApi,
    resizedColumnsStore: ResizedColumnsStore,
    column: Column,
) => {
    const columnWidth = column.getActualWidth();
    const allColumns = columnApi.getAllColumns();

    allColumns.forEach((col) => {
        if (isMeasureColumn(col)) {
            columnApi.setColumnWidth(col, columnWidth);
        }
    });
    resizedColumnsStore.addAllMeasureColumns(columnWidth, allColumns);
};
