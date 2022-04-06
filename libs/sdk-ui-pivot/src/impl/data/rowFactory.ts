// (C) 2007-2022 GoodData Corporation
import { IntlShape } from "react-intl";

import { DataViewFacade, IMappingHeader } from "@gooddata/sdk-ui";
import { ROW_SUBTOTAL, ROW_TOTAL } from "../base/constants";
import { DataValue, IResultHeader, isResultAttributeHeader, isResultTotalHeader } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { isSeriesCol, SliceCol } from "../structure/tableDescriptorTypes";
import { TableDescriptor } from "../structure/tableDescriptor";
import { IAgGridPage, IGridRow, IGridTotalsRow } from "./resultTypes";
import { getSubtotalStyles } from "./dataSourceUtils";
import fill from "lodash/fill";
import findIndex from "lodash/findIndex";

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

function getCell(
    rowHeaderData: IResultHeader[][],
    rowIndex: number,
    rowHeader: SliceCol,
    rowHeaderIndex: number,
    intl: IntlShape,
):
    | {
          field: string;
          value: string | null;
          rowHeaderDataItem: IResultHeader;
          isSubtotal: boolean;
      }
    | undefined {
    const rowHeaderDataItem = rowHeaderData[rowHeaderIndex][rowIndex];
    const cell = {
        field: rowHeader.id,
        rowHeaderDataItem,
        isSubtotal: false,
    };

    if (isResultAttributeHeader(rowHeaderDataItem)) {
        return {
            ...cell,
            value: rowHeaderDataItem.attributeHeaderItem.name,
        };
    }

    if (isResultTotalHeader(rowHeaderDataItem)) {
        const totalName = rowHeaderDataItem.totalHeaderItem.name;
        return {
            ...cell,
            isSubtotal: true,
            value:
                getSubtotalLabelCellIndex(rowHeaderData, rowIndex) === rowHeaderIndex
                    ? intl.formatMessage({ id: `visualizations.totals.dropdown.title.${totalName}` })
                    : null,
        };
    }

    invariant(
        rowHeaderDataItem,
        "row header is not of type IResultAttributeHeaderItem or IResultTotalHeaderItem",
    );
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
        )!;
        if (isSubtotal) {
            row.type = ROW_SUBTOTAL;

            if (!row.subtotalStyle) {
                row.subtotalStyle = subtotalStyles[rowHeaderIndex] ?? undefined;
            }
        }

        row[field] = value;
        row.headerItemMap[field] = rowHeaderDataItem as IMappingHeader;
    });

    if (!tableDescriptor.hasDataLeafCols()) {
        // table has no leaf columns - it is a row-only table listing a bunch of
        // attribute element values. no point in going further as there is no additional
        // data to show
        return row;
    }

    cellData.forEach((cell: DataValue, cellIndex: number) => {
        const colId = tableDescriptor.headers.leafDataCols[cellIndex].id;

        invariant(colId);

        row[colId] = cell;
    });

    return row;
}

export function getRowTotals(
    tableDescriptor: TableDescriptor,
    dv: DataViewFacade,
    intl: IntlShape,
): IGridTotalsRow[] | null {
    if (!dv.rawData().hasTotals()) {
        return null;
    }

    const totals = dv.rawData().totals();

    invariant(totals && totals.length > 0);

    const colGrandTotals = totals[0];
    const colGrandTotalDefs = dv.definition.dimensions[0].totals;

    invariant(colGrandTotalDefs);

    const grandTotalColDescriptor = tableDescriptor.getGrandTotalCol();
    const grandTotalAttrDescriptor = grandTotalColDescriptor.attributeDescriptor;
    const leafColumns = tableDescriptor.zippedLeaves;

    return colGrandTotals.map((totalsPerLeafColumn: DataValue[], totalIdx: number) => {
        const grandTotalName = grandTotalColDescriptor.effectiveTotals[totalIdx].totalHeaderItem.name;
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

        totalsPerLeafColumn.forEach((value, idx) => {
            const [leafDescriptor] = leafColumns[idx];

            // if code bombs here then there must be something wrong in the table / datasource code because
            // totals cannot (by definition) appear in a table that does not have measures - yet here we are
            // processing totals
            invariant(isSeriesCol(leafDescriptor));

            measureCells[leafDescriptor.id] = value;

            if (
                calculatedForMeasures.indexOf(
                    leafDescriptor.seriesDescriptor.measureDescriptor.measureHeaderItem.localIdentifier,
                ) > -1
            ) {
                calculatedForColumns.push(leafDescriptor.id);
            }
        });

        return {
            colSpan: {
                count: tableDescriptor.sliceColCount(),
                headerKey: grandTotalColDescriptor.id,
            },
            ...measureCells,
            [grandTotalColDescriptor.id]: intl.formatMessage({
                id: `visualizations.totals.dropdown.title.${grandTotalName}`,
            }),
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

    const subtotalStyles = getSubtotalStyles(dimensions?.[0]);
    const rowData = minimalRowData.map((dataRow: DataValue[], dataRowIndex: number) =>
        getRow(tableDescriptor, dataRow, dataRowIndex, headerItems[0], subtotalStyles, intl),
    );

    const rowTotals = getRowTotals(tableDescriptor, dv, intl)!;

    return {
        rowData,
        rowTotals,
    };
}
