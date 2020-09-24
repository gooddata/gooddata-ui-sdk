// (C) 2007-2020 GoodData Corporation
import invariant, { InvariantError } from "ts-invariant";
import omit from "lodash/omit";
import omitBy from "lodash/omitBy";
import {
    getAttributeLocators,
    getColumnIdentifier,
    getColumnIdentifierFromDef,
    getIdsFromUri,
    getLastFieldId,
    getLastFieldType,
    getMappingHeaderMeasureItemLocalIdentifier,
    getParsedFields,
    getTreeLeaves,
    isMeasureColumn,
    getMeasureFormat,
    isSomeTotal,
} from "./agGridUtils";
import {
    FIELD_SEPARATOR,
    FIELD_TYPE_ATTRIBUTE,
    FIELD_TYPE_MEASURE,
    ID_SEPARATOR,
    VALUE_CLASS,
    HEADER_LABEL_CLASS,
    ROW_TOTAL_CLASS,
    ROW_SUBTOTAL_CLASS,
    DEFAULT_HEADER_FONT,
    DEFAULT_ROW_FONT,
    DEFAULT_SUBTOTAL_FONT,
    DEFAULT_TOTAL_FONT,
} from "./agGridConst";
import { identifyResponseHeader } from "./agGridHeaders";

import { IGridHeader, IGridRow } from "./agGridTypes";
import { ColDef, Column, ColumnApi, GridApi } from "@ag-grid-community/all-modules";
import {
    ColumnWidth,
    ColumnWidthItem,
    IAllMeasureColumnWidthItem,
    IAttributeColumnWidthItem,
    IMeasureColumnWidthItem,
    isAbsoluteColumnWidth,
    isAllMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    IResizedColumns,
    IAbsoluteColumnWidth,
    IManuallyResizedColumnsItem,
    IWeakMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
    isMeasureColumnLocator,
    IMeasureColumnLocator,
} from "../columnWidths";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { IAttributeDescriptor, IExecutionResult, IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import { getMeasureCellFormattedValue } from "./tableCell";

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

    public getManuallyResizedColumn(item: Column | ColDef): IManuallyResizedColumnsItem | undefined {
        const colId = getColumnIdentifier(item);

        if (this.manuallyResizedColumns[colId]) {
            return this.convertItem(this.manuallyResizedColumns[colId]);
        }

        const weakColumnWidth = this.getMatchedWeakMeasuresColumnWidth(item);

        if (weakColumnWidth) {
            return this.getWeakMeasureColumMapItem(weakColumnWidth);
        }

        if (isMeasureColumn(item) && this.isAllMeasureColumWidthUsed()) {
            return this.getAllMeasureColumMapItem();
        }
    }

    public isColumnManuallyResized(item: Column | ColDef): boolean {
        return !!this.getManuallyResizedColumn(item);
    }

    public addToManuallyResizedColumn(column: Column, allowGrowToFit: boolean = false): void {
        this.manuallyResizedColumns[getColumnIdentifier(column)] = {
            width: {
                value: column.getActualWidth(),
                ...getAllowGrowToFitProp(allowGrowToFit),
            },
        };

        column.getColDef().suppressSizeToFit = !allowGrowToFit;
    }

    public addAllMeasureColumn(columnWidth: number, allColumns: Column[]): void {
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
        this.weakMeasuresColumnWidths = {};
    }

    public addWeekMeasureColumn(column: Column): void {
        const width = column.getActualWidth();
        const measureHeaderLocalIdentifier = getMappingHeaderMeasureItemLocalIdentifier(column);
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

    public removeWeakMeasureColumn(column: Column): void {
        const weakColumnWidth = this.getMatchedWeakMeasuresColumnWidth(column);
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

    public removeFromManuallyResizedColumn(column: Column): void {
        const colId = getColumnIdentifier(column);
        const item = this.manuallyResizedColumns[colId];

        if (item) {
            this.manuallyResizedColumns = omit(this.manuallyResizedColumns, colId);

            if (!this.isAllMeasureColumWidthUsed() || !isMeasureColumn(column)) {
                column.getColDef().suppressSizeToFit = false;
            }
        }

        if (
            isMeasureColumn(column) &&
            (this.isAllMeasureColumWidthUsed() || this.getMatchedWeakMeasuresColumnWidth(column))
        ) {
            // TODO INE: consider creating weakItem with width: "auto" when alt+DC over allMeasure
            this.manuallyResizedColumns[colId] = this.getAutoSizeItem(column);
            column.getColDef().suppressSizeToFit = false;
        }
    }

    public getColumnWidthsFromMap(dv: DataViewFacade): ColumnWidthItem[] {
        const result = getColumnWidthsFromMap(this.manuallyResizedColumns, dv);
        if (this.isAllMeasureColumWidthUsed()) {
            result.push(this.getAllMeasureColumnWidth());
        }

        const weakColumnWidthItems: ColumnWidthItem[] = getWeakColumnWidthsFromMap(
            this.weakMeasuresColumnWidths,
        );

        return result.concat(weakColumnWidthItems);
    }

    public updateColumnWidths(columnWidths: ColumnWidthItem[] | undefined, dv: DataViewFacade): void {
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

        const columnWidthsByField = convertColumnWidthsToMap(columnWidthItems, dv);
        this.manuallyResizedColumns = columnWidthsByField;
    }

    public getMatchingColumnsByMeasure(targetColumn: Column, allColumns: Column[]): Column[] {
        const targetMeasureLocalIdentifier = getMappingHeaderMeasureItemLocalIdentifier(targetColumn);

        if (targetMeasureLocalIdentifier) {
            return allColumns.filter((col: Column) => {
                const measureLocalIdentifier = getMappingHeaderMeasureItemLocalIdentifier(col);
                return targetMeasureLocalIdentifier === measureLocalIdentifier;
            });
        }
        return [];
    }

    public getMatchedWeakMeasuresColumnWidth(item: Column | ColDef): IWeakMeasureColumnWidthItem | undefined {
        const measureHeaderLocalIdentifier = getMappingHeaderMeasureItemLocalIdentifier(item);

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

    private getAutoSizeItem(column: Column): IResizedColumnsCollectionItem {
        const measureHeaderLocalIdentifier = getMappingHeaderMeasureItemLocalIdentifier(column);
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
            };
        }
        if (isMeasureColumnWidthItem(columnWidth)) {
            const [field, width] = getMeasureColumnWidthItemFieldAndWidth(columnWidth, measureDescriptors);

            const locator: IMeasureColumnLocator = columnWidth.measureColumnWidthItem.locators.filter(
                isMeasureColumnLocator,
            )[0];
            const measureIdentifier = locator ? locator.measureLocatorItem.measureIdentifier : undefined;
            columnWidthsMap[field] = {
                width: widthValidator(width),
                measureIdentifier,
            };
        }
    });
    return columnWidthsMap;
};

const getAttributeColumnWidthItemFieldAndWidth = (
    columnWidthItem: IAttributeColumnWidthItem,
    attributeHeaders: IAttributeDescriptor[],
): [string, IAbsoluteColumnWidth] => {
    const localIdentifier = columnWidthItem.attributeColumnWidthItem.attributeIdentifier;

    const attributeHeader = attributeHeaders.find(
        (header) => header.attributeHeader.localIdentifier === localIdentifier,
    );
    invariant(attributeHeader, `Could not find attributeHeader with localIdentifier "${localIdentifier}"`);

    const field = identifyResponseHeader(attributeHeader!);
    return [field!, columnWidthItem.attributeColumnWidthItem.width];
};

const getMeasureColumnWidthItemFieldAndWidth = (
    columnWidthItem: IMeasureColumnWidthItem,
    measureHeaderItems: IMeasureDescriptor[],
): [string, ColumnWidth] => {
    const keys: string[] = [];
    columnWidthItem.measureColumnWidthItem.locators.forEach((locator) => {
        if (isMeasureColumnLocator(locator)) {
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
            const key = `a${ID_SEPARATOR}${getIdsFromUri(locator.attributeLocatorItem.element!).join(
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
                    throw new InvariantError(
                        `width value for attributeColumnWidthItem has to be number ${colId}`,
                    );
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

        throw new InvariantError(`could not find attribute header matching ${colId}`);
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
    throw new InvariantError(`could not find header matching ${colId}`);
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

export const getWeakColumnWidthsFromMap = (map: IWeakMeasureColumnWidthItemsMap): ColumnWidthItem[] => {
    return Object.keys(map).map((measureIdentifier: string) => {
        return map[measureIdentifier];
    });
};

const defaultWidthValidator = (width: ColumnWidth): ColumnWidth => {
    if (isAbsoluteColumnWidth(width)) {
        return {
            ...width,
            value: Math.min(Math.max(width.value, MIN_WIDTH), MANUALLY_SIZED_MAX_WIDTH),
        };
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
    defaultColumnWidth: number,
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
                columnDefinition.suppressSizeToFit = !manualSize.allowGrowToFit;
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
): void => {
    if (!columnApi) {
        return;
    }

    const columns = columnApi.getAllColumns();

    columns.forEach((col) => {
        const resizedColumn = resizedColumnsStore.getManuallyResizedColumn(col);
        resizedColumn
            ? (col.getColDef().suppressSizeToFit = !resizedColumn.allowGrowToFit)
            : (col.getColDef().suppressSizeToFit = false);
    });
};

export const isColumnAutoResized = (autoResizedColumns: IResizedColumns, resizedColumnId: string): boolean =>
    Boolean(resizedColumnId && autoResizedColumns[resizedColumnId]);

export const resetColumnsWidthToDefault = (
    columnApi: ColumnApi,
    columns: Column[],
    resizedColumnsStore: ResizedColumnsStore,
    autoResizedColumns: IResizedColumns,
    defaultWidth: number,
): void => {
    columns.forEach((col) => {
        const id = getColumnIdentifier(col);

        if (resizedColumnsStore.isColumnManuallyResized(col)) {
            const manuallyResizedColumn = resizedColumnsStore.getManuallyResizedColumn(col);
            if (manuallyResizedColumn) {
                columnApi.setColumnWidth(col, manuallyResizedColumn.width);
            }
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
): void => {
    const columnWidth = column.getActualWidth();
    const allColumns = columnApi.getAllColumns();

    allColumns.forEach((col) => {
        if (isMeasureColumn(col)) {
            columnApi.setColumnWidth(col, columnWidth);
        }
    });
    resizedColumnsStore.addAllMeasureColumn(columnWidth, allColumns);
};

export const resizeWeakMeasureColumns = (
    columnApi: ColumnApi,
    resizedColumnsStore: ResizedColumnsStore,
    column: Column,
): void => {
    const allColumns = columnApi.getAllColumns();
    resizedColumnsStore.addWeekMeasureColumn(column);
    allColumns.forEach((col) => {
        const weakColumnWidth = resizedColumnsStore.getMatchedWeakMeasuresColumnWidth(col);
        if (isMeasureColumn(col) && weakColumnWidth) {
            columnApi.setColumnWidth(col, weakColumnWidth.measureColumnWidthItem.width.value);
            col.getColDef().suppressSizeToFit = true;
        }
    });
};

const getAllowGrowToFitProp = (allowGrowToFit: boolean | undefined): { allowGrowToFit?: boolean } =>
    allowGrowToFit ? { allowGrowToFit } : {};

/**
 * Custom implementation of columns autoresizing according content
 * https://en.morzel.net/post/resizing-all-ag-gird-react-columns
 */

export const getMaxWidth = (
    context: CanvasRenderingContext2D,
    text: string | undefined,
    hasSort: boolean,
    maxWidth: number | undefined,
): number | undefined => {
    if (!text) {
        return;
    }
    const width = hasSort
        ? context.measureText(text).width + SORT_ICON_WIDTH
        : context.measureText(text).width;

    return maxWidth === undefined || width > maxWidth ? width : undefined;
};

const getMaxWidthCached = (
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number | undefined,
    widthsCache: Map<string, number>,
): number | undefined => {
    const cachedWidth = widthsCache.get(text);
    let width;

    if (cachedWidth === undefined) {
        width = context.measureText(text).width;
        widthsCache.set(text, width);
    } else {
        width = cachedWidth;
    }

    return maxWidth === undefined || width > maxWidth ? width : undefined;
};

const valueFormatter = (text: string, colDef: IGridHeader, execution: IExecutionResult, separators: any) => {
    return text !== undefined
        ? getMeasureCellFormattedValue(text, getMeasureFormat(colDef, execution), separators)
        : null;
};

const collectWidths = (config: any, row: IGridRow, maxWidths: Map<string, number>) => {
    const { context } = config;
    config.columns.forEach((column: Column) => {
        const cd: IGridHeader = column.getColDef() as IGridHeader;
        if (cd.field) {
            const text = row[cd.field];
            const formattedText =
                isMeasureColumn(column) && valueFormatter(text, cd, config.execution, config.separators);
            const textForCalculation = formattedText || text;
            const maxWidth = cd.field ? maxWidths.get(cd.field) : undefined;
            let possibleMaxWidth;

            if (config.cache) {
                possibleMaxWidth = getMaxWidthCached(context, textForCalculation, maxWidth, config.cache);
            } else {
                possibleMaxWidth = getMaxWidth(context, textForCalculation, false, maxWidth);
            }

            if (possibleMaxWidth) {
                maxWidths.set(cd.field, possibleMaxWidth);
            }
        }
    });
};

interface CalculateColumnWidthsConfig {
    context: CanvasRenderingContext2D | null;
    columns: Column[];
    rowData: IGridRow[];
    totalData: IGridRow[];
    execution: IExecutionResult | null;
    measureHeaders: boolean;
    headerFont: string;
    subtotalFont: string;
    totalFont: string;
    rowFont: string;
    padding: number;
    separators: any;
    cache: Map<string, number>;
}

const calculateColumnWidths = (config: CalculateColumnWidthsConfig) => {
    const { context } = config;
    const maxWidths = new Map<string, number>();

    if (config.measureHeaders && context) {
        context.font = config.headerFont;

        config.columns.forEach((column: Column) => {
            const colDef: ColDef = column.getColDef();
            const maxWidth = colDef.field ? maxWidths.get(colDef.field) : undefined;
            const possibleMaxWidth = getMaxWidth(context, colDef.headerName, !!colDef.sort, maxWidth);

            if (colDef.field && possibleMaxWidth) {
                maxWidths.set(colDef.field, possibleMaxWidth);
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

    const updatedColumnDefs = config.columns.map((column: Column) => {
        const cd: ColDef = column.getColDef();
        if (cd.field) {
            const maxWidth = maxWidths.get(cd.field);
            const newWidth = maxWidth ? Math.ceil(maxWidth + config.padding) : 0;
            return {
                ...cd,
                width: Math.min(Math.max(MIN_WIDTH, newWidth), AUTO_SIZED_MAX_WIDTH),
            };
        }
        return cd;
    });

    return updatedColumnDefs;
};

const getDisplayedRowData = (gridApi: GridApi): IGridRow[] => {
    const rowCount = gridApi.getDisplayedRowCount();
    const rowData: IGridRow[] = [];
    for (let index = 0; index < rowCount; index++) {
        const item: IGridRow = gridApi.getDisplayedRowAtIndex(index).data;
        rowData.push(item);
    }
    return rowData;
};

const getDisplayedTotalData = (gridApi: GridApi): IGridRow[] => {
    const totalCount = gridApi.getPinnedBottomRowCount();
    const totalData: IGridRow[] = [];
    for (let index = 0; index < totalCount; index++) {
        const item: IGridRow = gridApi.getPinnedBottomRow(index).data;
        totalData.push(item);
    }
    return totalData;
};

export const autoresizeAllColumns = (
    columns: Column[],
    gridApi: GridApi,
    columnApi: ColumnApi,
    execution: IExecutionResult | null,
    options: {
        measureHeaders: boolean;
        headerFont: string;
        subtotalFont: string;
        totalFont: string;
        rowFont: string;
        padding: number;
        separators: any;
    },
): IResizedColumns => {
    if (gridApi && columnApi && execution) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const rowData = getDisplayedRowData(gridApi);
        const totalData = getDisplayedTotalData(gridApi);
        const autoResizedColumns = {};
        const updatedColumDefs = calculateColumnWidths({
            context,
            columns,
            rowData,
            totalData,
            execution,
            measureHeaders: options.measureHeaders,
            headerFont: options.headerFont,
            subtotalFont: options.subtotalFont,
            totalFont: options.totalFont,
            rowFont: options.rowFont,
            padding: options.padding,
            separators: options.separators,
            cache: new Map(),
        });

        updatedColumDefs.forEach((columnDef: ColDef) => {
            if (columnDef.field && columnDef.width !== undefined) {
                columnApi.setColumnWidth(columnDef.field, columnDef.width);
                autoResizedColumns[getColumnIdentifier(columnDef)] = {
                    width: columnDef.width,
                };
            }
        });
        return autoResizedColumns;
    }
    return {};
};

const getTableFont = (containerRef: HTMLDivElement, className: string, defaultFont: string) => {
    const element = containerRef.getElementsByClassName(className)[0];
    let font = defaultFont;
    if (element) {
        font = window.getComputedStyle(element).font;
    }
    return font;
};

export const getTableFonts = (
    containerRef: HTMLDivElement,
): { headerFont: string; rowFont: string; subtotalFont: string; totalFont: string } => {
    /**
     * All fonts are gotten from first element with given class. Once we will have font different for each cell/header/row this will not work
     */
    const headerFont = getTableFont(containerRef, HEADER_LABEL_CLASS, DEFAULT_HEADER_FONT);
    const rowFont = getTableFont(containerRef, VALUE_CLASS, DEFAULT_ROW_FONT);
    const subtotalFont = getTableFont(containerRef, ROW_SUBTOTAL_CLASS, DEFAULT_SUBTOTAL_FONT);
    const totalFont = getTableFont(containerRef, ROW_TOTAL_CLASS, DEFAULT_TOTAL_FONT);
    return { headerFont, rowFont, subtotalFont, totalFont };
};
