// (C) 2007-2023 GoodData Corporation
import { IntlShape } from "react-intl";

import {
    DataViewFacade,
    emptyHeaderTitleFromIntl,
    getAttributeHeaderItemName,
    getMappingHeaderFormattedName,
    IMappingHeader,
    BucketNames,
} from "@gooddata/sdk-ui";
import { valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";
import { ROW_SUBTOTAL, ROW_TOTAL } from "../base/constants.js";
import {
    DataValue,
    IResultHeader,
    IExecutionDefinition,
    isResultAttributeHeader,
    isResultTotalHeader,
    isResultMeasureHeader,
    IResultMeasureHeader,
    isMeasureDescriptor,
    bucketsFind,
    isAttribute,
    attributeLocalId,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import {
    isSeriesCol,
    SliceCol,
    SliceMeasureCol,
    MixedHeadersCol,
    MixedValuesCol,
} from "../structure/tableDescriptorTypes.js";
import { TableDescriptor } from "../structure/tableDescriptor.js";
import { IAgGridPage, IGridRow, IGridTotalsRow } from "./resultTypes.js";
import { getSubtotalStyles } from "./dataSourceUtils.js";
import fill from "lodash/fill.js";
import findIndex from "lodash/findIndex.js";
import { messages } from "../../locales.js";

function getSubtotalLabelCellIndex(resultHeaderItems: IResultHeader[][], rowIndex: number): number {
    return findIndex(resultHeaderItems, (headerItem) => isResultTotalHeader(headerItem[rowIndex]));
}

function getMinimalRowData(dv: DataViewFacade): DataValue[][] {
    const data = dv.rawData().twoDimData();
    const rowHeaders = dv.meta().allHeaders()[0];
    const numberOfRowHeaderItems = (rowHeaders[0] || []).length;

    return data.length > 0
        ? data
        : // if there are no measures only attributes
          // create array of [null] of length equal to the number of row dimension headerItems
          (fill(Array(numberOfRowHeaderItems), [null]) as DataValue[][]);
}

function getMeasureHeaders(rowHeaderData: IResultHeader[][]) {
    return rowHeaderData
        .find((headers): headers is IResultMeasureHeader[] => isResultMeasureHeader(headers[0]))
        ?.filter(isMeasureDescriptor);
}

function getTotalLinkValue(measureHeaders: IResultMeasureHeader[] | undefined, totalLink: number) {
    return (
        measureHeaders?.find((m) => m.measureHeaderItem.order === totalLink)?.measureHeaderItem.name ?? null
    );
}

function getCell(
    rowHeaderData: IResultHeader[][],
    rowIndex: number,
    rowHeader: SliceCol | SliceMeasureCol | MixedHeadersCol | MixedValuesCol,
    rowHeaderIndex: number,
    intl: IntlShape,
): {
    field: string;
    value: string | null;
    rowHeaderDataItem: IResultHeader;
    isSubtotal: boolean;
} {
    const rowHeaderDataItem = rowHeaderData[rowHeaderIndex][rowIndex];
    const cell = {
        field: rowHeader.id,
        rowHeaderDataItem,
        isSubtotal: false,
    };

    if (isResultAttributeHeader(rowHeaderDataItem) || isResultMeasureHeader(rowHeaderDataItem)) {
        return {
            ...cell,
            value: valueWithEmptyHandling(
                getMappingHeaderFormattedName(rowHeaderDataItem),
                emptyHeaderTitleFromIntl(intl),
            ),
        };
    } else if (isResultTotalHeader(rowHeaderDataItem)) {
        const totalName = rowHeaderDataItem.totalHeaderItem.name;
        const totalLink = rowHeaderDataItem.totalHeaderItem.measureIndex;

        if (totalLink !== undefined) {
            const measureHeaders = getMeasureHeaders(rowHeaderData);
            const value = getTotalLinkValue(measureHeaders, totalLink);

            return {
                ...cell,
                isSubtotal: true,
                value,
            };
        }
        return {
            ...cell,
            isSubtotal: true,
            value:
                getSubtotalLabelCellIndex(rowHeaderData, rowIndex) === rowHeaderIndex
                    ? intl.formatMessage(messages[totalName])
                    : null,
        };
    } else {
        invariant(false, "row header is not of type IResultAttributeHeaderItem or IResultTotalHeaderItem");
    }
}

export function getRow(
    tableDescriptor: TableDescriptor,
    cellData: DataValue[],
    rowIndex: number,
    rowHeaderData: IResultHeader[][],
    subtotalStyles: (string | null)[],
    intl: IntlShape,
): IGridRow {
    const row: IGridRow = {
        headerItemMap: {},
    };

    tableDescriptor.headers.sliceCols.forEach((rowHeader, rowHeaderIndex) => {
        const { isSubtotal, field, value, rowHeaderDataItem } = getCell(
            rowHeaderData,
            rowIndex,
            rowHeader,
            rowHeaderIndex,
            intl,
        );
        if (isSubtotal) {
            row.type = ROW_SUBTOTAL;

            if (!row.subtotalStyle) {
                row.subtotalStyle = subtotalStyles[rowHeaderIndex] ?? undefined;
            }
        }

        row[field] = value;
        row.headerItemMap[field] = rowHeaderDataItem as IMappingHeader;
    });

    tableDescriptor.headers.sliceMeasureCols.forEach((rowHeader) => {
        const { field, value, rowHeaderDataItem } = getCell(
            rowHeaderData,
            rowIndex,
            rowHeader,
            rowHeader.index,
            intl,
        );

        row[field] = value;
        row.headerItemMap[field] = rowHeaderDataItem as IMappingHeader;
        // when metrics in rows store measureDescriptor as part of each row
        if (isResultMeasureHeader(rowHeaderDataItem)) {
            row.measureDescriptor = tableDescriptor.getMeasures()[rowHeaderDataItem.measureHeaderItem.order];
        } else if (isResultTotalHeader(rowHeaderDataItem)) {
            const totalLink = rowHeaderDataItem.totalHeaderItem.measureIndex;
            if (totalLink !== undefined) {
                row.measureDescriptor = tableDescriptor.getMeasures()[totalLink];
            }
        }
    });

    tableDescriptor.headers.mixedValuesCols.forEach((measureValueHeader, headerIndex) => {
        row[measureValueHeader.id] = cellData[headerIndex];
    });

    if (!tableDescriptor.hasDataLeafCols()) {
        // table has no leaf columns - it is a row-only table listing a bunch of
        // attribute element values. no point in going further as there is no additional
        // data to show
        return row;
    }

    cellData.forEach((cell: DataValue, cellIndex: number) => {
        const colId = tableDescriptor.headers.leafDataCols[cellIndex]?.id;

        row[colId] = cell;
    });

    return row;
}

function getGrandTotalAttribute(definition: IExecutionDefinition) {
    const rowBucket = bucketsFind(definition.buckets, BucketNames.ATTRIBUTE);
    const firstItem = rowBucket?.items?.[0];

    return isAttribute(firstItem) ? attributeLocalId(firstItem) : "";
}

function getMeasureItem(tableDescriptor: TableDescriptor, localIdentifier: string) {
    return tableDescriptor
        .getMeasures()
        .find((measure) => measure.measureHeaderItem.localIdentifier === localIdentifier);
}

function getEffectiveTotals(tableDescriptor: TableDescriptor, dv: DataViewFacade) {
    const grandTotalColDescriptor = tableDescriptor.getGrandTotalCol();
    const grandTotalAttributeId = getGrandTotalAttribute(dv.definition);
    const colGrandTotalDefs = dv.definition.dimensions[0].totals;
    const colGrandTotalDefsOuter =
        colGrandTotalDefs?.filter((total) => total.attributeIdentifier === grandTotalAttributeId) ?? [];

    // effective totals do not contain duplicities (e.g. when 'sum' is defined on multiple measures). This is fine
    // when measures are in columns (only one row is needed for each grand total), but when measures are in rows,
    // we need a row for each total definition => take from total definitions and prepare header items.
    return tableDescriptor.isTransposed()
        ? colGrandTotalDefsOuter.map((def) => ({
              totalHeaderItem: { name: def.type, measureIdentifier: def.measureIdentifier },
          }))
        : grandTotalColDescriptor.effectiveTotals;
}
export function getRowTotals(
    tableDescriptor: TableDescriptor,
    dv: DataViewFacade,
    intl: IntlShape,
): IGridTotalsRow[] | null {
    if (!dv.rawData().hasRowTotals()) {
        return null;
    }

    const rowTotals = dv.rawData().rowTotals();

    invariant(rowTotals && rowTotals.length > 0);

    const colGrandTotals = rowTotals;
    const colGrandTotalDefs = dv.definition.dimensions[0].totals;

    if (!colGrandTotalDefs) {
        return null;
    }

    const effectiveTotals = getEffectiveTotals(tableDescriptor, dv);
    const grandTotalColDescriptor = tableDescriptor.getGrandTotalCol();
    const grandTotalAttrDescriptor = grandTotalColDescriptor.attributeDescriptor;
    const leafColumns = tableDescriptor.zippedLeaves;

    const totalOfTotals = dv.rawData().totalOfTotals();

    return colGrandTotals.map((totalsPerLeafColumn: DataValue[], totalIdx: number) => {
        const effectiveTotal = effectiveTotals[totalIdx];
        const grandTotalName = effectiveTotal?.totalHeaderItem.name;
        const measureCells: Record<string, DataValue> = {};
        const calculatedForColumns: string[] = [];
        const calculatedForMeasures = colGrandTotalDefs
            .filter((total) => {
                return (
                    grandTotalName === total.type &&
                    total.attributeIdentifier === grandTotalAttrDescriptor.attributeHeader.localIdentifier
                );
            })
            .map((total) => total.measureIdentifier);

        const mergedTotals = totalOfTotals
            ? [...totalsPerLeafColumn, ...totalOfTotals[0][totalIdx]]
            : totalsPerLeafColumn;

        mergedTotals.forEach((value, idx) => {
            const leafColumn = leafColumns[idx];
            const leafDescriptor = leafColumn ? leafColumn[0] : tableDescriptor.headers.mixedValuesCols[idx];

            measureCells[leafDescriptor.id] = value;

            if (
                !isSeriesCol(leafDescriptor) ||
                calculatedForMeasures.indexOf(
                    (leafDescriptor as any).seriesDescriptor.measureDescriptor.measureHeaderItem
                        .localIdentifier,
                ) > -1
            ) {
                calculatedForColumns.push(leafDescriptor.id);
            }
        });

        let measuresDefInGrandTotals = {};
        if (tableDescriptor.isTransposed()) {
            const mixedCol = tableDescriptor.headers.sliceMeasureCols[0];
            const effectiveMeasureId = (effectiveTotal?.totalHeaderItem as any)?.measureIdentifier;
            const effectiveMeasureItem = getMeasureItem(tableDescriptor, effectiveMeasureId);
            measuresDefInGrandTotals = {
                [mixedCol.id]: effectiveMeasureItem?.measureHeaderItem?.name,
                measureDescriptor: effectiveMeasureItem,
            };
        }

        return {
            colSpan: {
                count: tableDescriptor.sliceColCount() - tableDescriptor.sliceMeasureColCount(),
                headerKey: grandTotalColDescriptor.id,
            },
            ...measureCells,
            [grandTotalColDescriptor.id]: intl.formatMessage({
                id: `visualizations.totals.dropdown.title.${grandTotalName}`,
            }),
            ...measuresDefInGrandTotals,
            calculatedForColumns,
            type: ROW_TOTAL,
        };
    });
}

/**
 * Given data view with a page of data and a table descriptor, this factory function creates page for consumption
 * by ag-grid.
 *
 * @param dv - data view with data to process (OK if its empty and has no data)
 * @param tableDescriptor - table descriptor
 * @param intl - intl bundle to get localized subtotal names
 */
export function createAgGridPage(
    dv: DataViewFacade,
    tableDescriptor: TableDescriptor,
    intl: IntlShape,
): IAgGridPage {
    const headerItems = dv.meta().allHeaders();
    const dimensions = dv.definition.dimensions;

    const minimalRowData: DataValue[][] = getMinimalRowData(dv);

    if (tableDescriptor.headers.mixedHeadersCols.length > 0) {
        const rowData: IGridRow[] = [];

        // rows with attribute values
        headerItems[1].forEach((attributes, rowIndex) => {
            const headerColumn = tableDescriptor.headers.mixedHeadersCols[0];
            const attributeName = dv.data().slices().toArray()[0].descriptor.descriptors[rowIndex]
                .attributeHeader.formOf.name;

            const row: IGridRow = {
                [headerColumn.id]: attributeName,
                headerItemMap: {},
            };

            tableDescriptor.headers.mixedValuesCols.forEach((column, columnIndex) => {
                const header = attributes[columnIndex];
                if (isResultAttributeHeader(header)) {
                    // TODO what about formattedName?
                    row[column.id] = valueWithEmptyHandling(
                        getAttributeHeaderItemName(header.attributeHeaderItem),
                        emptyHeaderTitleFromIntl(intl),
                    );
                }
            });

            rowData.push(row);
        });

        // rows with measure values
        headerItems[0][0].filter(isResultMeasureHeader).map((measureHeader, measureRowIndex) => {
            const headerColumn = tableDescriptor.headers.mixedHeadersCols[0];

            const measureHeaderItem = measureHeader.measureHeaderItem;
            const row: IGridRow = {
                [headerColumn.id]: measureHeaderItem.name,
                measureDescriptor: tableDescriptor.getMeasures()[measureHeaderItem.order],
                headerItemMap: {},
            };
            tableDescriptor.headers.mixedValuesCols.forEach((column, columnIndex) => {
                row[column.id] = minimalRowData[measureRowIndex][columnIndex];
            });

            rowData.push(row);
        });

        return {
            rowData,
            rowTotals: [],
        };
    } else {
        const columnTotalsData = dv.rawData().columnTotals();

        const subtotalStyles = getSubtotalStyles(dimensions?.[0]);
        const rowData = minimalRowData.map((dataRow: DataValue[], dataRowIndex: number) => {
            const mergedDataRowWithColumnTotals = dv.rawData().hasColumnTotals()
                ? [...dataRow, ...columnTotalsData![dataRowIndex]]
                : dataRow;
            return getRow(
                tableDescriptor,
                mergedDataRowWithColumnTotals,
                dataRowIndex,
                headerItems[0],
                subtotalStyles,
                intl,
            );
        });

        const rowTotals = getRowTotals(tableDescriptor, dv, intl)!;

        return {
            rowData,
            rowTotals,
        };
    }
}
