import range = require('lodash/range');

import { unwrap } from './utils';
import { Execution } from '@gooddata/typings';
import * as invariant from 'invariant';

export interface IGridHeader {
    headerName: string;
    field?: string;
    children?: IGridHeader[];
    render?: string;
}

export const FIELD_SEPARATOR = '|';

// TODO: Move to typings in RAIL-909
export function isAttributeHeaderItem(header: Execution.IResultHeaderItem):
    header is Execution.IResultAttributeHeaderItem {
    return (header as Execution.IResultAttributeHeaderItem).attributeHeaderItem !== undefined;
}

export function isMeasureHeaderItem(header: Execution.IResultHeaderItem):
    header is Execution.IResultMeasureHeaderItem {
    return (header as Execution.IResultMeasureHeaderItem).measureHeaderItem !== undefined;
}

export function isTotalHeaderItem(header: Execution.IResultHeaderItem):
header is Execution.IResultTotalHeaderItem {
    return (header as Execution.IResultTotalHeaderItem).totalHeaderItem !== undefined;
}

export function isAttributeHeader(header: Execution.IHeader):
    header is Execution.IAttributeHeader {
    return (header as Execution.IAttributeHeader).attributeHeader !== undefined;
}

export function isMeasureGroupHeader(header: Execution.IHeader):
    header is Execution.IMeasureGroupHeader {
    return (header as Execution.IMeasureGroupHeader).measureGroupHeader !== undefined;
}

export const identifyHeader = (header: Execution.IResultHeaderItem, fieldPrefix = '') => {
    if (isAttributeHeaderItem(header)) {
        return `${fieldPrefix}a_${header.attributeHeaderItem.uri.split(/\/(\d*)\/elements\?id=/).slice(1).join('_')}`;
    }
    if (isMeasureHeaderItem(header)) {
        return `${fieldPrefix}m_${header.measureHeaderItem.order}`;
    }
    if (isTotalHeaderItem(header)) {
        return `${fieldPrefix}t_${header.totalHeaderItem.type}`;
    }
    invariant(false, `Unknown header type: ${JSON.stringify(header)}`);
};

export const headerToGrid = (header: Execution.IResultHeaderItem, fieldPrefix = '') => {
    const internalHeader = unwrap(header);
    return {
        headerName: internalHeader.name,
        field: fieldPrefix + identifyHeader(header)
    };
};

export const getColumnHeaders = (
    headerDimension: Execution.IResultHeaderItem[][],
    attributeIndex = 0,
    attributeValueStart = 0,
    attributeValueEnd: number = undefined,
    fieldPrefix = ''
) => {
    if (!headerDimension.length) {
        return [];
    }

    const currentHeaders = headerDimension[attributeIndex];
    const lastIndex = attributeValueEnd !== undefined ? attributeValueEnd : currentHeaders.length - 1;
    const hierarchy: IGridHeader[] = [];

    for (let index = attributeValueStart; index < lastIndex + 1; index += 1) {
        let headerCount = 0;
        const header: IGridHeader = headerToGrid(currentHeaders[index], fieldPrefix);
        const isNextHeaderIdentical = () => (
            currentHeaders[index + 1] && header.field === identifyHeader(currentHeaders[index + 1], fieldPrefix)
        );
        while (isNextHeaderIdentical()) {
            headerCount += 1;
            index += 1;
        }
        if (attributeIndex !== headerDimension.length - 1) {
            header.children = getColumnHeaders(
                headerDimension,
                attributeIndex + 1,
                index - headerCount,
                index,
                header.field + FIELD_SEPARATOR
            );
        }
        // Here we will add custom header renderers when we need them
        // header.render = 'RowHeader';
        hierarchy.push(header);
    }

    return hierarchy;
};

export const getRowHeaders = (rowDimensionHeaders: Execution.IHeader[]) => {
    return rowDimensionHeaders.map((headerItemWrapped: Execution.IHeader) => {
        const headerItem = unwrap(headerItemWrapped);
        return {
            headerName: headerItem.name,
            // Row dimensions must contain only attribute headers
            field: `a_${headerItem.uri.split('/obj/')[1]}`
            // Here we can turn on rowGrouping if we switch to the enterprise license
            // rowGroup: true,
            // hide: true
        };
    });
};

export const getFields = (dataHeaders: Execution.IResultHeaderItem[][]) => {
    return range((dataHeaders[0] || []).length).map((cellIndex: number) => {
        const fieldList = dataHeaders.map(
            (header: Execution.IResultHeaderItem[]) => identifyHeader(header[cellIndex])
        );
        return fieldList.join(FIELD_SEPARATOR);
    }) as string[];
};

export const getRow = (
    cellData: Execution.DataValue[],
    rowIndex: number,
    columnFields: string[],
    rowHeaders: IGridHeader[],
    rowHeaderData: Execution.IResultHeaderItem[][]
) => {
    const row = {};
    cellData.forEach((cell: Execution.DataValue, cellIndex: number) => {
        rowHeaders.forEach((rowHeader, rowHeaderIndex) => {
            row[rowHeader.field] = unwrap(rowHeaderData[rowHeaderIndex][rowIndex]).name;
        });
        const columnKey = columnFields[cellIndex];
        // If columnKey doesn't exists, this is a table with attributes only. Do not assign measure value then.
        if (columnKey) {
            row[columnKey] = cell;
        }
    });
    return row;
};

export const getMinimalRowData = (
    data: Execution.DataValue[][],
    rowHeaderItems: Execution.IResultHeaderItem[][]
) => {
    const numberOfRowHeaderItems = (rowHeaderItems[0] || []).length;

    return data.length > 0
        ? data
        // if there are no measures only attributes
        // create array of [null] of length equal to the number of row dimension headerItems
        : Array(numberOfRowHeaderItems).fill([null]) as Execution.DataValue[][];
};

export const executionToAGGridAdapter = (executionResult: Execution.IExecutionResponses) => {
    const {
        executionResponse: {
            dimensions
        },
        executionResult: {
            data,
            headerItems
        }
    } = executionResult;

    const columnAttributeHeaderCount = dimensions[1]
        .headers.filter((header: Execution.IHeader) => (
            !!(header as Execution.IAttributeHeader).attributeHeader
        )).length;

    const columnHeaders: IGridHeader[] = getColumnHeaders(headerItems[1]);
    const groupColumnHeaders: IGridHeader[] = columnAttributeHeaderCount > 0 ? [{
        headerName: dimensions[1].headers
            .map((header: Execution.IHeader) => {
                if (isAttributeHeader(header)) {
                    return header.attributeHeader.name;
                }
                if (isMeasureGroupHeader(header) && header.measureGroupHeader.items.length > 1) {
                    return 'measures';
                }
                return null;
            })
            .filter((item: string) => item !== null)
            .join('/'),
        children: columnHeaders
    }] : columnHeaders;

    const rowHeaders: IGridHeader[] = getRowHeaders(dimensions[0].headers);

    const columnDefs: IGridHeader[] = [
        ...rowHeaders,
        ...groupColumnHeaders
    ];

    const columnFields: string[] = getFields(headerItems[1]);
    // AGTable execution should always return a two-dimensional array (Execution.DataValue[][])
    const minimalRowData: Execution.DataValue[][] = getMinimalRowData(data as Execution.DataValue[][], headerItems[0]);
    const rowData = (minimalRowData).map(
        (dataRow: Execution.DataValue[], dataRowIndex: number) =>
            getRow(dataRow, dataRowIndex, columnFields, rowHeaders, headerItems[0])
    );

    return {
        columnDefs,
        rowData
        // , dataSource: null as any
    };
};
