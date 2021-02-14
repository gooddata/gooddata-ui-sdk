// (C) 2007-2021 GoodData Corporation
import invariant, { InvariantError } from "ts-invariant";
import omit from "lodash/omit";
import omitBy from "lodash/omitBy";
import { isMeasureColumn } from "../base/agGridUtils";
import {
    DEFAULT_HEADER_FONT,
    DEFAULT_ROW_FONT,
    DEFAULT_SUBTOTAL_FONT,
    DEFAULT_TOTAL_FONT,
    HEADER_LABEL_CLASS,
    ROW_SUBTOTAL_CLASS,
    ROW_TOTAL_CLASS,
    VALUE_CLASS,
} from "../base/constants";

import { ColDef, Column, ColumnApi, GridApi } from "@ag-grid-community/all-modules";
import {
    ColumnWidth,
    ColumnWidthItem,
    IAbsoluteColumnWidth,
    IAllMeasureColumnWidthItem,
    IAttributeColumnWidthItem,
    IManuallyResizedColumnsItem,
    IMeasureColumnWidthItem,
    IResizedColumns,
    isAbsoluteColumnWidth,
    isAllMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
    IWeakMeasureColumnWidthItem,
} from "../../columnWidths";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { getMeasureCellFormattedValue } from "../cell/cellUtils";
import isEmpty from "lodash/isEmpty";
import { TableDescriptor } from "../structure/tableDescriptor";
import {
    agColId,
    AnyCol,
    DataColGroup,
    DataColLeaf,
    isDataColGroup,
    isDataColLeaf,
    isSliceCol,
    SliceCol,
} from "../structure/tableDescriptorTypes";
import { createColumnLocator } from "../structure/colLocatorFactory";
import { colMeasureLocalId } from "../structure/colAccessors";
import { IGridRow } from "../data/resultTypes";
import { isSomeTotal } from "../data/dataSourceUtils";

export const MIN_WIDTH = 60;
export const MANUALLY_SIZED_MAX_WIDTH = 2000;
export const AUTO_SIZED_MAX_WIDTH = 500;
export const SORT_ICON_WIDTH = 12;

//
//
//

function isColumnWidthAuto(columnWidth: ColumnWidth): boolean {
    return columnWidth.value === "auto";
}

export interface IResizedColumnsCollection {
    [columnIdentifier: string]: IResizedColumnsCollectionItem;
}

export interface IResizedColumnsCollectionItem {
    width: ColumnWidth;
    measureIdentifier?: string;
}

export interface IWeakMeasureColumnWidthItemsMap {
    [measureIdentifier: string]: IWeakMeasureColumnWidthItem;
}

export class ResizedColumnsStore {
    private manuallyResizedColumns: IResizedColumnsCollection;
    private allMeasureColumnWidth: number | null;
    private weakMeasuresColumnWidths: IWeakMeasureColumnWidthItemsMap;

    public constructor(
        manuallyResizedColumns: IResizedColumnsCollection = {},
        allMeasureColumnWidth: number | null = null,
        weakMeasuresColumnWidths: IWeakMeasureColumnWidthItemsMap = {},
    ) {
        this.manuallyResizedColumns = manuallyResizedColumns;
        this.allMeasureColumnWidth = allMeasureColumnWidth;
        this.weakMeasuresColumnWidths = weakMeasuresColumnWidths;
    }

    public getManuallyResizedColumn2(col: AnyCol): IManuallyResizedColumnsItem | undefined {
        if (this.manuallyResizedColumns[col.id]) {
            return this.convertItem(this.manuallyResizedColumns[col.id]);
        }

        const weakColumnWidth = this.getMatchedWeakMeasuresColumnWidth(col);

        if (weakColumnWidth) {
            return this.getWeakMeasureColumMapItem(weakColumnWidth);
        }

        if (isDataColLeaf(col) && this.isAllMeasureColumWidthUsed()) {
            return this.getAllMeasureColumMapItem();
        }
    }

    public getManuallyResizedColumn(
        tableDescriptor: TableDescriptor,
        item: Column | ColDef,
    ): IManuallyResizedColumnsItem | undefined {
        const colId = agColId(item);
        const col = tableDescriptor.getCol(colId);

        return this.getManuallyResizedColumn2(col);
    }

    public isColumnManuallyResized(tableDescriptor: TableDescriptor, item: Column | ColDef): boolean {
        return !!this.getManuallyResizedColumn(tableDescriptor, item);
    }

    public addToManuallyResizedColumn(column: Column, allowGrowToFit: boolean = false): void {
        this.manuallyResizedColumns[agColId(column)] = {
            width: {
                value: column.getActualWidth(),
                ...getAllowGrowToFitProp(allowGrowToFit),
            },
        };

        column.getColDef().suppressSizeToFit = !allowGrowToFit;
    }

    /**
     * Sets width for all column measures.
     *
     * Here Be Dragons 1: this also mutates input columns and sets supressSizeToFit prop to true.
     *
     * @param columnWidth - column width
     * @param allColumns - all columns in table
     */
    public addAllMeasureColumn(columnWidth: number, allColumns: Column[]): void {
        this.allMeasureColumnWidth = columnWidth;
        allColumns.forEach((col) => {
            if (isMeasureColumn(col)) {
                const colId = agColId(col);
                if (this.manuallyResizedColumns[colId]) {
                    this.manuallyResizedColumns = omit(this.manuallyResizedColumns, colId);
                }
                col.getColDef().suppressSizeToFit = true;
            }
        });
        this.weakMeasuresColumnWidths = {};
    }

    public addWeekMeasureColumn(tableDescriptor: TableDescriptor, column: Column): void {
        const width = column.getActualWidth();
        const measureHeaderLocalIdentifier = colMeasureLocalId(tableDescriptor.getCol(column));

        if (measureHeaderLocalIdentifier) {
            this.weakMeasuresColumnWidths[measureHeaderLocalIdentifier] = {
                measureColumnWidthItem: {
                    width: {
                        value: width,
                    },
                    locator: {
                        measureLocatorItem: {
                            measureIdentifier: measureHeaderLocalIdentifier,
                        },
                    },
                },
            };

            const shouldBeRemoved = (resizedColumnItem: IResizedColumnsCollectionItem) =>
                resizedColumnItem.measureIdentifier === measureHeaderLocalIdentifier;

            this.manuallyResizedColumns = omitBy(this.manuallyResizedColumns, shouldBeRemoved);
        }
    }

    public removeAllMeasureColumns(): void {
        this.allMeasureColumnWidth = null;
        const shouldBeRemoved = (resizedColumnItem: IResizedColumnsCollectionItem) =>
            isColumnWidthAuto(resizedColumnItem.width);
        this.manuallyResizedColumns = omitBy(this.manuallyResizedColumns, shouldBeRemoved);

        this.weakMeasuresColumnWidths = {};
    }

    public removeWeakMeasureColumn(tableDescriptor: TableDescriptor, column: Column): void {
        const col = tableDescriptor.getCol(agColId(column));
        const weakColumnWidth = this.getMatchedWeakMeasuresColumnWidth(col);

        if (weakColumnWidth) {
            this.weakMeasuresColumnWidths = omit(
                this.weakMeasuresColumnWidths,
                weakColumnWidth.measureColumnWidthItem.locator.measureLocatorItem.measureIdentifier,
            );
            const shouldBeRemoved = (resizedColumnItem: IResizedColumnsCollectionItem) => {
                return (
                    isColumnWidthAuto(resizedColumnItem.width) &&
                    this.isMatchingWeakWidth(resizedColumnItem, weakColumnWidth) &&
                    !this.isAllMeasureColumWidthUsed()
                );
            };
            this.manuallyResizedColumns = omitBy(this.manuallyResizedColumns, shouldBeRemoved);
        }
    }

    /**
     * Removes manual sizing setting from the store.
     *
     * Here Be Dragons 1: This method may be modifying the suppressSizeToFit setting
     * of the columns (e.g. mutating one of the inputs).
     *
     * Here Be Dragons 2: This method is adding what appears like 'dummy garage placeholder'
     * 'auto' widths when all measure width is used and then measure column is
     * removed. Not sure why.
     *
     * @param tableDescriptor
     * @param column
     */
    public removeFromManuallyResizedColumn(tableDescriptor: TableDescriptor, column: Column): void {
        const col = tableDescriptor.getCol(agColId(column));
        const item = this.manuallyResizedColumns[col.id];

        if (item) {
            this.manuallyResizedColumns = omit(this.manuallyResizedColumns, col.id);

            if (!this.isAllMeasureColumWidthUsed() || !isMeasureColumn(column)) {
                column.getColDef().suppressSizeToFit = false;
            }
        }

        if (
            isDataColLeaf(col) &&
            (this.isAllMeasureColumWidthUsed() || this.getMatchedWeakMeasuresColumnWidth(col))
        ) {
            // TODO INE: consider creating weakItem with width: "auto" when alt+DC over allMeasure
            this.manuallyResizedColumns[col.id] = this.getAutoSizeItem(tableDescriptor, column);
            column.getColDef().suppressSizeToFit = false;
        }
    }

    public getColumnWidthsFromMap(tableDescriptor: TableDescriptor): ColumnWidthItem[] {
        const result = getColumnWidthsFromMap(this.manuallyResizedColumns, tableDescriptor);
        if (this.isAllMeasureColumWidthUsed()) {
            result.push(this.getAllMeasureColumnWidth());
        }

        const weakColumnWidthItems: ColumnWidthItem[] = getWeakColumnWidthsFromMap(
            this.weakMeasuresColumnWidths,
        );

        return result.concat(weakColumnWidthItems);
    }

    public updateColumnWidths(
        tableDescriptor: TableDescriptor,
        columnWidths: ColumnWidthItem[] | undefined,
    ): void {
        const allMeasureWidthItem = this.filterAllMeasureColumnWidthItem(columnWidths);

        if (allMeasureWidthItem && isAllMeasureColumnWidthItem(allMeasureWidthItem)) {
            const validatedAllMeasureColumnWidth = defaultWidthValidator(
                allMeasureWidthItem.measureColumnWidthItem.width,
            );
            this.allMeasureColumnWidth = isAbsoluteColumnWidth(validatedAllMeasureColumnWidth)
                ? validatedAllMeasureColumnWidth.value
                : null;
        } else {
            this.allMeasureColumnWidth = null;
        }

        this.weakMeasuresColumnWidths = this.filterWeakColumnWidthItems(columnWidths);

        const columnWidthItems = this.filterStrongColumnWidthItems(columnWidths);

        const columnWidthsByField = convertColumnWidthsToMap(tableDescriptor, columnWidthItems);
        this.manuallyResizedColumns = columnWidthsByField;
    }

    public getMatchingColumnsByMeasure(
        tableDescriptor: TableDescriptor,
        targetColumn: Column,
        allColumns: Column[],
    ): Column[] {
        const targetMeasureLocalIdentifier = colMeasureLocalId(tableDescriptor.getCol(targetColumn));

        if (targetMeasureLocalIdentifier) {
            return allColumns.filter((col: Column) => {
                const measureLocalIdentifier = colMeasureLocalId(tableDescriptor.getCol(col));
                return targetMeasureLocalIdentifier === measureLocalIdentifier;
            });
        }
        return [];
    }

    public getMatchedWeakMeasuresColumnWidth(col: AnyCol): IWeakMeasureColumnWidthItem | undefined {
        if (!isDataColLeaf(col)) {
            return;
        }

        const measureHeaderLocalIdentifier =
            col.seriesDescriptor.measureDescriptor.measureHeaderItem.localIdentifier;

        if (measureHeaderLocalIdentifier) {
            return this.weakMeasuresColumnWidths[measureHeaderLocalIdentifier];
        }
    }

    private filterAllMeasureColumnWidthItem(
        columnWidths: ColumnWidthItem[] | undefined,
    ): IAllMeasureColumnWidthItem | undefined {
        if (columnWidths) {
            return columnWidths.filter(isAllMeasureColumnWidthItem)[0];
        }
    }

    private filterStrongColumnWidthItems(columnWidths: ColumnWidthItem[] | undefined) {
        if (columnWidths) {
            return columnWidths.filter(
                (item) => isAttributeColumnWidthItem(item) || isMeasureColumnWidthItem(item),
            );
        }
        return [];
    }

    private filterWeakColumnWidthItems(
        columnWidths: ColumnWidthItem[] | undefined,
    ): IWeakMeasureColumnWidthItemsMap {
        if (columnWidths) {
            const onlyWeakWidthItems: IWeakMeasureColumnWidthItem[] = columnWidths.filter(
                isWeakMeasureColumnWidthItem,
            );
            return onlyWeakWidthItems.reduce(
                (map: IWeakMeasureColumnWidthItemsMap, weakWidthItem: IWeakMeasureColumnWidthItem) => {
                    const validatedWidth = defaultWidthValidator(weakWidthItem.measureColumnWidthItem.width);

                    if (isAbsoluteColumnWidth(validatedWidth)) {
                        return {
                            ...map,
                            [weakWidthItem.measureColumnWidthItem.locator.measureLocatorItem
                                .measureIdentifier]: {
                                measureColumnWidthItem: {
                                    ...weakWidthItem.measureColumnWidthItem,
                                    width: {
                                        ...weakWidthItem.measureColumnWidthItem.width,
                                        value: validatedWidth.value,
                                    },
                                },
                            },
                        };
                    }

                    return map;
                },
                {},
            );
        }
        return {};
    }

    private convertItem(item: IResizedColumnsCollectionItem): IManuallyResizedColumnsItem | undefined {
        // columns with width.value = auto are hidden
        if (isAbsoluteColumnWidth(item.width)) {
            const { width } = item;
            return {
                width: width.value,
                ...getAllowGrowToFitProp(width.allowGrowToFit),
            };
        }
    }

    private getWeakMeasureColumMapItem(item: IWeakMeasureColumnWidthItem): IManuallyResizedColumnsItem {
        return {
            width: item.measureColumnWidthItem.width.value,
        };
    }

    private isAllMeasureColumWidthUsed() {
        return this.allMeasureColumnWidth !== null;
    }

    private getAutoSizeItem(tableDescriptor: TableDescriptor, column: Column): IResizedColumnsCollectionItem {
        const measureHeaderLocalIdentifier = colMeasureLocalId(tableDescriptor.getCol(column));
        const result: IResizedColumnsCollectionItem = { width: { value: "auto" } };
        if (measureHeaderLocalIdentifier) {
            result.measureIdentifier = measureHeaderLocalIdentifier;
        }
        return result;
    }

    private getAllMeasureColumMapItem(): IManuallyResizedColumnsItem {
        return { width: this.allMeasureColumnWidth! };
    }

    private getAllMeasureColumnWidth(): IAllMeasureColumnWidthItem {
        return {
            measureColumnWidthItem: {
                width: {
                    value: this.allMeasureColumnWidth!,
                },
            },
        };
    }

    private isMatchingWeakWidth(
        item: IResizedColumnsCollectionItem,
        weakColumnWidth: IWeakMeasureColumnWidthItem,
    ) {
        return (
            item.measureIdentifier ===
            weakColumnWidth.measureColumnWidthItem.locator.measureLocatorItem.measureIdentifier
        );
    }
}

//
//
//

export function convertColumnWidthsToMap(
    tableDescriptor: TableDescriptor,
    columnWidths: ColumnWidthItem[],
    widthValidator: (width: ColumnWidth) => ColumnWidth = defaultWidthValidator,
): IResizedColumnsCollection {
    if (!columnWidths) {
        return {};
    }
    const columnWidthsMap: IResizedColumnsCollection = {};

    columnWidths.forEach((columnWidth: ColumnWidthItem) => {
        if (isAttributeColumnWidthItem(columnWidth)) {
            const [field, width] = getAttributeColumnWidthItemFieldAndWidth(tableDescriptor, columnWidth);
            columnWidthsMap[field] = {
                width: widthValidator(width),
            };
        }
        if (isMeasureColumnWidthItem(columnWidth)) {
            const result = getMeasureColumnWidthItemFieldAndWidth(tableDescriptor, columnWidth);

            if (!result) {
                return;
            }

            const [col, width] = result;

            columnWidthsMap[col.id] = {
                width: widthValidator(width),
                measureIdentifier: colMeasureLocalId(col),
            };
        }
    });
    return columnWidthsMap;
}

function getAttributeColumnWidthItemFieldAndWidth(
    tableDescriptor: TableDescriptor,
    columnWidthItem: IAttributeColumnWidthItem,
): [string, IAbsoluteColumnWidth] {
    const col = tableDescriptor.matchAttributeWidthItem(columnWidthItem);

    invariant(
        col,
        `Could not find column descriptor for width item for attribute "${columnWidthItem.attributeColumnWidthItem.attributeIdentifier}"`,
    );

    return [col.id, columnWidthItem.attributeColumnWidthItem.width];
}

function getMeasureColumnWidthItemFieldAndWidth(
    tableDescriptor: TableDescriptor,
    columnWidthItem: IMeasureColumnWidthItem,
): [DataColLeaf | DataColGroup, ColumnWidth] | undefined {
    const col = tableDescriptor.matchMeasureWidthItem(columnWidthItem);

    if (!col) {
        // it is a valid case that no column matches locators. data may change, elements are no longer there etc..
        return undefined;
    }

    return [col, columnWidthItem.measureColumnWidthItem.width];
}

function getSizeItemByColId(col: AnyCol, width: ColumnWidth): ColumnWidthItem {
    if (isSliceCol(col)) {
        const attributeIdentifier = col.attributeDescriptor.attributeHeader.localIdentifier;
        if (isAbsoluteColumnWidth(width)) {
            return {
                attributeColumnWidthItem: {
                    width,
                    attributeIdentifier,
                },
            };
        } else {
            throw new InvariantError(`width value for attributeColumnWidthItem has to be number ${col.id}`);
        }
    } else if (isDataColGroup(col)) {
        return {
            measureColumnWidthItem: {
                width,
                locators: createColumnLocator(col),
            },
        };
    } else if (isDataColLeaf(col)) {
        return {
            measureColumnWidthItem: {
                width,
                locators: createColumnLocator(col),
            },
        };
    }
    throw new InvariantError(`could not find header matching ${col.id}`);
}

export function getColumnWidthsFromMap(
    map: IResizedColumnsCollection,
    tableDescriptor: TableDescriptor,
): ColumnWidthItem[] {
    return Object.keys(map).map((colId: string) => {
        const { width } = map[colId];
        const col: AnyCol = tableDescriptor.getCol(colId);
        const sizeItem = getSizeItemByColId(col, width);

        invariant(sizeItem, `unable to find size item by filed ${colId}`);

        return sizeItem;
    });
}

export function getWeakColumnWidthsFromMap(map: IWeakMeasureColumnWidthItemsMap): ColumnWidthItem[] {
    return Object.keys(map).map((measureIdentifier: string) => {
        return map[measureIdentifier];
    });
}

function defaultWidthValidator(width: ColumnWidth): ColumnWidth {
    if (isAbsoluteColumnWidth(width)) {
        return {
            ...width,
            value: Math.min(Math.max(width.value, MIN_WIDTH), MANUALLY_SIZED_MAX_WIDTH),
        };
    }
    return width;
}

/**
 * This function _mutates_ the incoming column defs according to the sizing rules.
 */
export function updateColumnDefinitionsWithWidths(
    tableDescriptor: TableDescriptor,
    resizedColumnsStore: ResizedColumnsStore,
    autoResizedColumns: IResizedColumns,
    defaultColumnWidth: number,
    isGrowToFitEnabled: boolean,
    growToFittedColumns: IResizedColumns = {},
): void {
    const sliceCols = tableDescriptor.zippedSliceCols;
    const leaves = tableDescriptor.zippedLeaves;

    const allSizableCols: Array<[SliceCol | DataColLeaf | DataColGroup, ColDef]> = [];
    allSizableCols.push(...sliceCols);
    allSizableCols.push(...leaves);

    allSizableCols.forEach(([colDesc, colDef]) => {
        const colId = colDesc.id;
        const manualSize = resizedColumnsStore.getManuallyResizedColumn2(colDesc);
        const autoResizeSize = autoResizedColumns[colId];

        colDef.maxWidth = MANUALLY_SIZED_MAX_WIDTH;

        if (manualSize) {
            colDef.width = manualSize.width;
            colDef.suppressSizeToFit = !manualSize.allowGrowToFit;
        } else {
            colDef.suppressSizeToFit = false;
            colDef.width = autoResizeSize ? autoResizeSize.width : defaultColumnWidth;
            if (isGrowToFitEnabled) {
                const growToFittedColumn = growToFittedColumns[colId];

                if (growToFittedColumn) {
                    colDef.width = growToFittedColumn.width;
                    if (growToFittedColumn.width > MANUALLY_SIZED_MAX_WIDTH) {
                        colDef.maxWidth = undefined;
                    }
                }
            }
        }
    });
}

export function syncSuppressSizeToFitOnColumns(
    tableDescriptor: TableDescriptor,
    resizedColumnsStore: ResizedColumnsStore,
    columnApi: ColumnApi,
): void {
    if (!columnApi) {
        return;
    }

    const columns: Column[] = columnApi.getAllColumns();

    columns.forEach((col) => {
        const resizedColumn = resizedColumnsStore.getManuallyResizedColumn(tableDescriptor, col);
        resizedColumn
            ? (col.getColDef().suppressSizeToFit = !resizedColumn.allowGrowToFit)
            : (col.getColDef().suppressSizeToFit = false);
    });
}

export function isColumnAutoResized(autoResizedColumns: IResizedColumns, resizedColumnId: string): boolean {
    return Boolean(resizedColumnId && autoResizedColumns[resizedColumnId]);
}

export function resetColumnsWidthToDefault(
    tableDescriptor: TableDescriptor,
    columnApi: ColumnApi,
    columns: Column[],
    resizedColumnsStore: ResizedColumnsStore,
    autoResizedColumns: IResizedColumns,
    defaultWidth: number,
): void {
    columns.forEach((col) => {
        const id = agColId(col);

        if (resizedColumnsStore.isColumnManuallyResized(tableDescriptor, col)) {
            const manuallyResizedColumn = resizedColumnsStore.getManuallyResizedColumn(tableDescriptor, col);
            if (manuallyResizedColumn) {
                columnApi.setColumnWidth(col, manuallyResizedColumn.width);
            }
        } else if (isColumnAutoResized(autoResizedColumns, id)) {
            columnApi.setColumnWidth(col, autoResizedColumns[id].width);
        } else {
            columnApi.setColumnWidth(col, defaultWidth);
        }
    });
}

export function resizeAllMeasuresColumns(
    columnApi: ColumnApi,
    resizedColumnsStore: ResizedColumnsStore,
    column: Column,
): void {
    const columnWidth = column.getActualWidth();
    const allColumns = columnApi.getAllColumns();

    allColumns.forEach((col) => {
        if (isMeasureColumn(col)) {
            columnApi.setColumnWidth(col, columnWidth);
        }
    });

    resizedColumnsStore.addAllMeasureColumn(columnWidth, allColumns);
}

export function resizeWeakMeasureColumns(
    tableDescriptor: TableDescriptor,
    columnApi: ColumnApi,
    resizedColumnsStore: ResizedColumnsStore,
    column: Column,
): void {
    const allColumns: Column[] = columnApi.getAllColumns();

    resizedColumnsStore.addWeekMeasureColumn(tableDescriptor, column);

    allColumns.forEach((col) => {
        const colDesc = tableDescriptor.getCol(col);
        const weakColumnWidth = resizedColumnsStore.getMatchedWeakMeasuresColumnWidth(colDesc);

        if (isMeasureColumn(col) && weakColumnWidth) {
            columnApi.setColumnWidth(col, weakColumnWidth.measureColumnWidthItem.width.value);
            col.getColDef().suppressSizeToFit = true;
        }
    });
}

function getAllowGrowToFitProp(allowGrowToFit: boolean | undefined): { allowGrowToFit?: boolean } {
    return allowGrowToFit ? { allowGrowToFit } : {};
}

interface CalculateColumnWidthsConfig {
    tableDescriptor: TableDescriptor;
    context: CanvasRenderingContext2D | null;
    columns: Column[];
    rowData: IGridRow[];
    totalData: IGridRow[];
    measureHeaders: boolean;
    headerFont: string;
    subtotalFont: string;
    totalFont: string;
    rowFont: string;
    padding: number;
    separators: any;
    cache: Map<string, number>;
}

export function getMaxWidth(
    context: CanvasRenderingContext2D,
    text: string | undefined,
    hasSort: boolean,
    maxWidth: number | undefined,
): number | undefined {
    if (!text) {
        return;
    }

    const width = hasSort
        ? context.measureText(text).width + SORT_ICON_WIDTH
        : context.measureText(text).width;

    return maxWidth === undefined || width > maxWidth ? width : undefined;
}

export function getMaxWidthCached(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number | undefined,
    widthsCache: Map<string, number>,
): number | undefined {
    const cachedWidth = widthsCache.get(text);
    let width;

    if (cachedWidth === undefined) {
        width = context.measureText(text).width;
        widthsCache.set(text, width);
    } else {
        width = cachedWidth;
    }

    return maxWidth === undefined || width > maxWidth ? width : undefined;
}

function valueFormatter(text: string, col: DataColLeaf, separators: any) {
    return text !== undefined
        ? getMeasureCellFormattedValue(text, col.seriesDescriptor.measureFormat(), separators)
        : null;
}

function collectWidths(
    config: CalculateColumnWidthsConfig,
    row: IGridRow,
    maxWidths: Map<string, number>,
): void {
    const { context } = config;
    config.columns.forEach((column: Column) => {
        const col = config.tableDescriptor.getCol(column);

        if (col && context) {
            const text = row[col.id];
            const formattedText = isDataColLeaf(col) && valueFormatter(text, col, config.separators);
            const textForCalculation = formattedText || text;
            const maxWidth = col.id ? maxWidths.get(col.id) : undefined;
            let possibleMaxWidth;

            if (config.cache) {
                possibleMaxWidth = getMaxWidthCached(context, textForCalculation, maxWidth, config.cache);
            } else {
                possibleMaxWidth = getMaxWidth(context, textForCalculation, false, maxWidth);
            }

            if (possibleMaxWidth) {
                maxWidths.set(col.id, possibleMaxWidth);
            }
        }
    });
}

export function getUpdatedColumnDefs(
    columns: Column[],
    maxWidths: Map<string, number>,
    padding: number,
): ColDef[] {
    return columns.map((column: Column) => {
        const colDef: ColDef = column.getColDef();
        const colId = agColId(colDef);

        if (colId) {
            const maxWidth = maxWidths.get(colId);
            const newWidth = maxWidth ? Math.ceil(maxWidth + padding) : 0;

            return {
                ...colDef,
                width: Math.min(Math.max(MIN_WIDTH, newWidth), AUTO_SIZED_MAX_WIDTH),
            };
        }

        return colDef;
    });
}

function calculateColumnWidths(config: CalculateColumnWidthsConfig) {
    const { context } = config;
    const maxWidths = new Map<string, number>();

    if (config.measureHeaders && context) {
        context.font = config.headerFont;

        config.columns.forEach((column: Column) => {
            const colDef: ColDef = column.getColDef();
            const colId = agColId(colDef);
            const maxWidth = colId ? maxWidths.get(colId) : undefined;
            const possibleMaxWidth = getMaxWidth(context, colDef.headerName, !!colDef.sort, maxWidth);

            if (colId && possibleMaxWidth) {
                maxWidths.set(colId, possibleMaxWidth);
            }
        });
    }

    config.rowData.forEach((row: IGridRow) => {
        if (context) {
            context.font = isSomeTotal(row.type) ? config.subtotalFont : config.rowFont;
            collectWidths(config, row, maxWidths);
        }
    });

    config.totalData.forEach((row: IGridRow) => {
        if (context) {
            context.font = config.totalFont;
            collectWidths(config, row, maxWidths);
        }
    });

    return getUpdatedColumnDefs(config.columns, maxWidths, config.padding);
}

function getDisplayedRowData(gridApi: GridApi): IGridRow[] {
    const rowCount = gridApi.getDisplayedRowCount();
    const rowData: IGridRow[] = [];
    for (let index = 0; index < rowCount; index++) {
        const item: IGridRow = gridApi.getDisplayedRowAtIndex(index).data;
        if (item) {
            rowData.push(item);
        }
    }
    return rowData;
}

function getDisplayedTotalData(gridApi: GridApi): IGridRow[] {
    const totalCount = gridApi.getPinnedBottomRowCount();
    const totalData: IGridRow[] = [];
    for (let index = 0; index < totalCount; index++) {
        const item: IGridRow = gridApi.getPinnedBottomRow(index).data;
        if (item) {
            totalData.push(item);
        }
    }
    return totalData;
}

function getTableFont(containerRef: HTMLDivElement, className: string, defaultFont: string) {
    const element = containerRef.getElementsByClassName(className)[0];
    if (!element) {
        return defaultFont;
    }

    const { font, fontWeight, fontSize, fontFamily } = window.getComputedStyle(element);
    return isEmpty(font) ? `${fontWeight} ${fontSize} ${fontFamily}` : font;
}

function getTableFonts(
    containerRef: HTMLDivElement,
): { headerFont: string; rowFont: string; subtotalFont: string; totalFont: string } {
    /**
     * All fonts are gotten from first element with given class. Once we will have font different for each cell/header/row this will not work
     */
    const headerFont = getTableFont(containerRef, HEADER_LABEL_CLASS, DEFAULT_HEADER_FONT);
    const rowFont = getTableFont(containerRef, VALUE_CLASS, DEFAULT_ROW_FONT);
    const subtotalFont = getTableFont(containerRef, ROW_SUBTOTAL_CLASS, DEFAULT_SUBTOTAL_FONT);
    const totalFont = getTableFont(containerRef, ROW_TOTAL_CLASS, DEFAULT_TOTAL_FONT);
    return { headerFont, rowFont, subtotalFont, totalFont };
}

/**
 * Ag-Grid API set desired column sizes (it *mutates* pivot table columns data).
 */
export function autoresizeAllColumns(columnApi: ColumnApi | null, autoResizedColumns: IResizedColumns): void {
    if (columnApi) {
        const columns = columnApi.getPrimaryColumns();

        columns.forEach((column: Column) => {
            const columnDef = column.getColDef();
            const colId = agColId(columnDef);
            const autoResizedColumn = autoResizedColumns[colId];

            if (colId && autoResizedColumn && autoResizedColumn.width) {
                columnApi.setColumnWidth(colId, autoResizedColumn.width);
            }
        });
    }
}

/**
 * Custom implementation of columns autoresizing according content: https://en.morzel.net/post/resizing-all-ag-gird-react-columns
 * Calculate the width of text for each grid cell and collect the minimum width needed for each of the gird columns.
 * Text width calculation is done efficiently with measureText method on Canvas.
 */
export function getAutoResizedColumns(
    tableDescriptor: TableDescriptor | null,
    gridApi: GridApi | null,
    columnApi: ColumnApi | null,
    execution: IExecutionResult | null,
    containerRef: HTMLDivElement,
    options: {
        measureHeaders: boolean;
        padding: number;
        separators: any;
    },
): IResizedColumns {
    if (tableDescriptor && gridApi && columnApi && execution) {
        const columns = columnApi.getPrimaryColumns();
        const { headerFont, rowFont, subtotalFont, totalFont } = getTableFonts(containerRef);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const rowData = getDisplayedRowData(gridApi);
        const totalData = getDisplayedTotalData(gridApi);
        const autoResizedColumns = {};
        const updatedColumDefs = calculateColumnWidths({
            tableDescriptor,
            context,
            columns,
            rowData,
            totalData,
            measureHeaders: options.measureHeaders,
            headerFont: headerFont,
            subtotalFont: subtotalFont,
            totalFont: totalFont,
            rowFont: rowFont,
            padding: options.padding,
            separators: options.separators,
            cache: new Map(),
        });
        updatedColumDefs.forEach((columnDef: ColDef) => {
            if (agColId(columnDef) && columnDef.width !== undefined) {
                autoResizedColumns[agColId(columnDef)] = {
                    width: columnDef.width,
                };
            }
        });

        return autoResizedColumns;
    }
    return {};
}
