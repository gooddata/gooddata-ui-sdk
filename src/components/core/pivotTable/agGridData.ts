// (C) 2007-2019 GoodData Corporation

import { AFM, Execution } from "@gooddata/typings";
import { IMappingHeader } from "../../../interfaces/MappingHeader";
import { getIdsFromUri } from "./agGridUtils";
import {
    FIELD_SEPARATOR,
    FIELD_TYPE_ATTRIBUTE,
    FIELD_TYPE_MEASURE,
    ID_SEPARATOR,
    ROW_TOTAL,
    ROW_SUBTOTAL,
} from "./agGridConst";
import { IGridHeader, IGridRow, IGridTotalsRow } from "./agGridTypes";
import invariant = require("invariant");
import InjectedIntl = ReactIntl.InjectedIntl;
import zipObject = require("lodash/zipObject");

/*
 * All code related to transforming data from our backend to ag-grid structures
 */

const getSubtotalLabelCellIndex = (
    resultHeaderItems: Execution.IResultHeaderItem[][],
    rowIndex: number,
): number => {
    return resultHeaderItems.findIndex(headerItem => Execution.isTotalHeaderItem(headerItem[rowIndex]));
};

const getCell = (
    rowHeaderData: Execution.IResultHeaderItem[][],
    rowIndex: number,
    rowHeader: IGridHeader,
    rowHeaderIndex: number,
    intl: InjectedIntl,
): {
    field: string;
    value: string;
    rowHeaderDataItem: Execution.IResultHeaderItem;
    isSubtotal: boolean;
} => {
    const rowHeaderDataItem = rowHeaderData[rowHeaderIndex][rowIndex];
    const cell = {
        field: rowHeader.field,
        rowHeaderDataItem,
        isSubtotal: false,
    };

    if (Execution.isAttributeHeaderItem(rowHeaderDataItem)) {
        return {
            ...cell,
            value: rowHeaderDataItem.attributeHeaderItem.name,
        };
    }

    if (Execution.isTotalHeaderItem(rowHeaderDataItem)) {
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

export const getRow = (
    cellData: Execution.DataValue[],
    rowIndex: number,
    columnFields: string[],
    rowHeaders: IGridHeader[],
    rowHeaderData: Execution.IResultHeaderItem[][],
    subtotalStyles: string[],
    intl: InjectedIntl,
): IGridRow => {
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

    cellData.forEach((cell: Execution.DataValue, cellIndex: number) => {
        const field = columnFields[cellIndex];
        if (field) {
            row[field] = cell;
        }
    });
    return row;
};

export const getRowTotals = (
    totals: Execution.DataValue[][][],
    columnKeys: string[],
    headers: Execution.IHeader[],
    resultSpec: AFM.IResultSpec,
    measureIds: string[],
    intl: InjectedIntl,
): IGridTotalsRow[] => {
    if (!totals) {
        return null;
    }

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

        const totalHeader: Execution.IAttributeHeader = headers.find(
            (header: Execution.IHeader) =>
                Execution.isAttributeHeader(header) &&
                getIdsFromUri(header.attributeHeader.uri)[0] === totalAttributeId,
        ) as Execution.IAttributeHeader;

        invariant(totalHeader, `Could not find header for ${totalAttributeKey}`);

        const measureCells = zipObject(measureKeys, totalRow);

        const grandTotalName = totalHeader.attributeHeader.totalItems[totalIndex].totalHeaderItem.name;
        const grandTotalAttributeIdentifier = totalHeader.attributeHeader.localIdentifier;

        // create measure ids in the form of "m_index" for measures having the current type of grand total
        // this makes it easier to match against in the cell renderer
        const rowTotalActiveMeasures = resultSpec.dimensions[0].totals
            .filter(t => t.type === grandTotalName && t.attributeIdentifier === grandTotalAttributeIdentifier)
            .map(t => `m_${measureIds.indexOf(t.measureIdentifier)}`);

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
