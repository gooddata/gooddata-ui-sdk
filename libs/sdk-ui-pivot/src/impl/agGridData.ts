// (C) 2007-2020 GoodData Corporation
import { IntlShape } from "react-intl";

import { IMappingHeader, DataViewFacade } from "@gooddata/sdk-ui";
import { getIdsFromUri, getSubtotalStyles, getTreeLeaves } from "./agGridUtils";
import {
    FIELD_SEPARATOR,
    FIELD_TYPE_ATTRIBUTE,
    FIELD_TYPE_MEASURE,
    ID_SEPARATOR,
    ROW_SUBTOTAL,
    ROW_TOTAL,
} from "./agGridConst";
import {
    IAgGridPage,
    IGridAdapterOptions,
    IGridHeader,
    IGridRow,
    IGridTotalsRow,
    TableHeaders,
} from "./agGridTypes";
import {
    DataValue,
    IAttributeDescriptor,
    IDimensionItemDescriptor,
    IResultHeader,
    isAttributeDescriptor,
    isResultAttributeHeader,
    isResultTotalHeader,
} from "@gooddata/sdk-backend-spi";
import { getMinimalRowData } from "./agGridHeaders";
import invariant from "ts-invariant";
import zipObject = require("lodash/zipObject");

/*
 * All code related to transforming data from our backend to ag-grid structures
 */

const getSubtotalLabelCellIndex = (resultHeaderItems: IResultHeader[][], rowIndex: number): number => {
    return resultHeaderItems.findIndex((headerItem) => isResultTotalHeader(headerItem[rowIndex]));
};

const getCell = (
    rowHeaderData: IResultHeader[][],
    rowIndex: number,
    rowHeader: IGridHeader,
    rowHeaderIndex: number,
    intl: IntlShape,
): {
    field: string;
    value: string;
    rowHeaderDataItem: IResultHeader;
    isSubtotal: boolean;
} => {
    const rowHeaderDataItem = rowHeaderData[rowHeaderIndex][rowIndex];
    const cell = {
        field: rowHeader.field,
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
};

export function getRow(
    cellData: DataValue[],
    rowIndex: number,
    columnFields: string[],
    rowHeaders: IGridHeader[],
    rowHeaderData: IResultHeader[][],
    subtotalStyles: string[],
    intl: IntlShape,
): IGridRow {
    const row: IGridRow = {
        headerItemMap: {},
    };

    rowHeaders.forEach((rowHeader, rowHeaderIndex) => {
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
                row.subtotalStyle = subtotalStyles[rowHeaderIndex];
            }
        }

        row[field] = value;
        row.headerItemMap[field] = rowHeaderDataItem as IMappingHeader;
    });

    cellData.forEach((cell: DataValue, cellIndex: number) => {
        const field = columnFields[cellIndex];
        if (field) {
            row[field] = cell;
        }
    });
    return row;
}

export const getRowTotals = (dv: DataViewFacade, columnKeys: string[], intl: IntlShape): IGridTotalsRow[] => {
    if (!dv.rawData().hasTotals()) {
        return null;
    }

    const totals = dv.rawData().totals();
    const headers = dv.meta().dimensions()[0].headers;
    const measureIds = dv
        .meta()
        .measureDescriptors()
        .map((m) => m.measureHeaderItem.localIdentifier);
    const totalDefs = dv.definition.dimensions[0].totals;

    return totals[0].map((totalRow: string[], totalIndex: number) => {
        const attributeKeys: string[] = [];
        const measureKeys: string[] = [];

        // assort keys by type
        columnKeys.forEach((key: any) => {
            const currentKey = key.split(FIELD_SEPARATOR).pop();
            const fieldType = currentKey.split(ID_SEPARATOR)[0];
            if (fieldType === FIELD_TYPE_ATTRIBUTE) {
                attributeKeys.push(currentKey);
            }
            if (fieldType === FIELD_TYPE_MEASURE) {
                measureKeys.push(key);
            }
        });

        const [totalAttributeKey] = attributeKeys;
        const totalAttributeId: string = totalAttributeKey.split(ID_SEPARATOR).pop();

        const totalAttrDescriptor: IAttributeDescriptor = headers.find(
            (dimItem: IDimensionItemDescriptor) =>
                isAttributeDescriptor(dimItem) &&
                getIdsFromUri(dimItem.attributeHeader.uri)[0] === totalAttributeId,
        ) as IAttributeDescriptor;

        invariant(totalAttrDescriptor, `Could not find header for ${totalAttributeKey}`);

        const measureCells = zipObject(measureKeys, totalRow);

        const grandTotalName =
            totalAttrDescriptor.attributeHeader.totalItems[totalIndex].totalHeaderItem.name;
        const grandTotalAttributeIdentifier = totalAttrDescriptor.attributeHeader.localIdentifier;

        // create measure ids in the form of "m_index" for measures having the current type of grand total
        // this makes it easier to match against in the cell renderer
        const rowTotalActiveMeasures = totalDefs
            .filter(
                (t) => t.type === grandTotalName && t.attributeIdentifier === grandTotalAttributeIdentifier,
            )
            .map((t) => `m_${measureIds.indexOf(t.measureIdentifier)}`);

        return {
            colSpan: {
                count: attributeKeys.length,
                headerKey: totalAttributeKey,
            },
            ...measureCells,
            [totalAttributeKey]: intl.formatMessage({
                id: `visualizations.totals.dropdown.title.${grandTotalName}`,
            }),
            rowTotalActiveMeasures,
            type: ROW_TOTAL,
        };
    });
};

export function createRowData(
    headers: TableHeaders,
    dv: DataViewFacade,
    intl: IntlShape,
    options: IGridAdapterOptions = {},
): IAgGridPage {
    const { addLoadingRenderer = null } = options;
    const headerItems = dv.meta().allHeaders();
    const dimensions = dv.definition.dimensions;

    const { rowHeaders, rowFields, colFields, allHeaders } = headers;

    if (addLoadingRenderer) {
        const leafColumnDefs = getTreeLeaves(allHeaders);
        if (leafColumnDefs[0]) {
            leafColumnDefs[0].cellRenderer = addLoadingRenderer;
        }
    }

    const minimalRowData: DataValue[][] = getMinimalRowData(dv);

    const subtotalStyles = getSubtotalStyles(dimensions ? dimensions[0] : null);
    const rowData = minimalRowData.map((dataRow: DataValue[], dataRowIndex: number) =>
        getRow(dataRow, dataRowIndex, colFields, rowHeaders, headerItems[0], subtotalStyles, intl),
    );

    const columnKeys = [...rowFields, ...colFields];

    const rowTotals = getRowTotals(dv, columnKeys, intl);

    return {
        columnDefs: allHeaders,
        rowData,
        rowTotals,
    };
}
