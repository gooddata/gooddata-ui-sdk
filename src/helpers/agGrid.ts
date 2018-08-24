import { Execution } from '@gooddata/typings';
import * as invariant from 'invariant';
import range = require('lodash/range');
import get = require('lodash/get');

import { unwrap } from './utils';
import { IDrillItem } from '../interfaces/DrillEvents';
import { IGridHeader, IColumnDefOptions, IGridRow, IGridAdapterOptions } from '../interfaces/AGGrid';
import { getTreeLeaves } from '../components/core/PivotTable';

export const ROW_ATTRIBUTE_COLUMN = 'ROW_ATTRIBUTE_COLUMN';
export const COLUMN_ATTRIBUTE_COLUMN = 'COLUMN_ATTRIBUTE_COLUMN';
export const MEASURE_COLUMN = 'MEASURE_COLUMN';
export const FIELD_SEPARATOR = '-';
export const FIELD_SEPARATOR_PLACEHOLDER = 'DASH';
export const DOT_PLACEHOLDER = 'DOT';

export const sanitizeField = (field: string) => (
    // Identifiers can not contain a dot character, because AGGrid cannot handle it.
    // Alternatively, we could handle it with a custom renderer (works in RowLoadingElement).
    field
        .replace(/\./g, DOT_PLACEHOLDER)
        .replace(new RegExp(FIELD_SEPARATOR, 'g'), FIELD_SEPARATOR_PLACEHOLDER)
);

export const identifyHeader = (header: Execution.IResultHeaderItem, fieldPrefix = '') => {
    if (Execution.isAttributeHeaderItem(header)) {
        return `${fieldPrefix}a_${
            sanitizeField(
                header.attributeHeaderItem.uri
                    .split(/\/(\d*)\/elements\?id=/)
                    .slice(1)
                    .join('_')
            )
        }`;
    }
    if (Execution.isMeasureHeaderItem(header)) {
        return `${fieldPrefix}m_${header.measureHeaderItem.order}`;
    }
    if (Execution.isTotalHeaderItem(header)) {
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

export const getMeasureDrillItem = (
    responseHeaders: Execution.IHeader[],
    header: Execution.IResultMeasureHeaderItem
) => {
    const measureGroupHeader = responseHeaders.find(
        responseHeader => Execution.isMeasureGroupHeader(responseHeader)
    ) as Execution.IMeasureGroupHeader;
    const measureHeaderItem = header.measureHeaderItem
        ? get(
            measureGroupHeader,
            ['measureGroupHeader', 'items', header.measureHeaderItem.order, 'measureHeaderItem'], null
        )
        : null;

    return measureHeaderItem ? {
        uri: measureHeaderItem.uri,
        identifier: measureHeaderItem.identifier,
        localIdentifier: measureHeaderItem.localIdentifier,
        title: measureHeaderItem.name
    } : null;
};

export const assignDrillItemsAndType = (
    header: IGridHeader,
    currentHeader: Execution.IResultHeaderItem,
    responseHeaders: Execution.IHeader[],
    headerIndex: number,
    drillItems: IDrillItem[]
) => {
    if (Execution.isAttributeHeaderItem(currentHeader)) {
        header.type = COLUMN_ATTRIBUTE_COLUMN;
        // attribute value uri
        drillItems.push({
            uri: currentHeader.attributeHeaderItem.uri,
            title: currentHeader.attributeHeaderItem.name
        });
        // attribute uri and identifier
        const attributeResponseHeader =
            responseHeaders[headerIndex % responseHeaders.length] as Execution.IAttributeHeader;
        const { uri, identifier, localIdentifier, name } = attributeResponseHeader.attributeHeader;
        drillItems.push({
            uri,
            identifier,
            localIdentifier,
            title: name
        });
        // This is where we could assign drillItems if we want to start drilling on column headers
        // It needs to have an empty array for some edge cases like column attributes without measures
    } else if (Execution.isMeasureHeaderItem(currentHeader)) {
        // measure uri and identifier
        header.type = MEASURE_COLUMN;
        drillItems.push(getMeasureDrillItem(responseHeaders, currentHeader));
        header.drillItems = drillItems;
        header.measureIndex = currentHeader.measureHeaderItem.order;
    }
};

export const getColumnHeaders = (
    resultHeaderDimension: Execution.IResultHeaderItem[][],
    responseHeaders: Execution.IHeader[],
    columnDefOptions: IColumnDefOptions = {},
    headerIndex = 0,
    headerValueStart = 0,
    headerValueEnd: number = undefined,
    fieldPrefix = '',
    parentDrillItems: IDrillItem[] = []
) => {
    if (!resultHeaderDimension.length) {
        return [];
    }

    const currentHeaders = resultHeaderDimension[headerIndex];
    const lastIndex = headerValueEnd !== undefined ? headerValueEnd : currentHeaders.length - 1;
    const hierarchy: IGridHeader[] = [];

    for (let index = headerValueStart; index < lastIndex + 1; index += 1) {
        let headerCount = 0;
        const currentHeader = currentHeaders[index];
        // current header can be either measureHeaderItem defined by order
        // or attributeHeaderItem defined by uri (attribute value uri)
        // We need to be able to match column by:
            // attribute uri or identifier
            // attribute value uri
            // measure uri or identifier
        const drillItems: IDrillItem[] = [...parentDrillItems];
        const header: IGridHeader = {
            drillItems: [],
            ...headerToGrid(currentHeader, fieldPrefix),
            ...columnDefOptions
        };
        assignDrillItemsAndType(header, currentHeader, responseHeaders, headerIndex, drillItems);

        const isNextHeaderIdentical = () => (
            currentHeaders[index + 1] && header.field === identifyHeader(currentHeaders[index + 1], fieldPrefix)
        );
        while (isNextHeaderIdentical()) {
            headerCount += 1;
            index += 1;
        }
        if (headerIndex !== resultHeaderDimension.length - 1) {
            header.children = getColumnHeaders(
                resultHeaderDimension,
                responseHeaders,
                columnDefOptions,
                headerIndex + 1,
                index - headerCount,
                index,
                header.field + FIELD_SEPARATOR,
                drillItems
            );
        }
        // Here we will add custom header renderers when we need them
        // header.render = 'RowHeader';
        hierarchy.push(header);
    }

    return hierarchy;
};

export const getRowHeaders = (
    rowDimensionHeaders: Execution.IHeader[],
    columnDefOptions: IColumnDefOptions,
    makeRowGroups: boolean
): IGridHeader[] => {
    return rowDimensionHeaders.map((headerItemWrapped: Execution.IHeader) => {
        const headerItem = unwrap(headerItemWrapped);
        const rowGroupProps = makeRowGroups ? {
            rowGroup: true,
            hide: true
        } : {};
        // attribute drill item
        const drillableItem: IDrillItem = {
            uri: headerItem.uri,
            identifier: headerItem.identifier,
            localIdentifier: headerItem.localIdentifier,
            title: headerItem.name
        };
        return {
            headerName: headerItem.name,
            type: ROW_ATTRIBUTE_COLUMN,
            // Row dimension must contain only attribute headers.
            field: `a_${sanitizeField(headerItem.uri.split('/obj/')[1])}`,
            drillItems: [drillableItem],
            ...rowGroupProps,
            ...columnDefOptions
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
    const row: IGridRow = {
        drillItemMap: {}
    };
    cellData.forEach((cell: Execution.DataValue, cellIndex: number) => {
        rowHeaders.forEach((rowHeader, rowHeaderIndex) => {
            const rowHeaderDataItem = rowHeaderData[rowHeaderIndex][rowIndex];
            // attribute value drill item
            const rowHeaderDrillItem: IDrillItem = Execution.isAttributeHeaderItem(rowHeaderDataItem)
                ? {
                    uri: rowHeaderDataItem.attributeHeaderItem.uri,
                    title: rowHeaderDataItem.attributeHeaderItem.name
                }
                : null;
            // Drilling on row headers supports only attribute headers
            invariant(rowHeaderDrillItem, 'row header is not of type IResultAttributeHeaderItem');
            row[rowHeader.field] = unwrap(rowHeaderDataItem).name;
            row.drillItemMap[rowHeader.field] = rowHeaderDrillItem;
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

export const executionToAGGridAdapter = (
    executionResponses: Execution.IExecutionResponses,
    options: IGridAdapterOptions = {}
) => {
    const {
        makeRowGroups = false,
        addLoadingRenderer = null,
        columnDefOptions
    } = options;

    const {
        executionResponse: {
            dimensions
        },
        executionResult: {
            data,
            headerItems
        }
    } = executionResponses;

    const columnAttributeHeaderCount = dimensions[1]
        .headers.filter((header: Execution.IHeader) => (
            !!(header as Execution.IAttributeHeader).attributeHeader
        )).length;

    const columnHeaders: IGridHeader[] = getColumnHeaders(headerItems[1], dimensions[1].headers, columnDefOptions);
    const groupColumnHeaders: IGridHeader[] = columnAttributeHeaderCount > 0 ? [{
        headerName: dimensions[1].headers
            .map((header: Execution.IHeader) => {
                if (Execution.isAttributeHeader(header)) {
                    return header.attributeHeader.name;
                }
                if (Execution.isMeasureGroupHeader(header) && header.measureGroupHeader.items.length > 1) {
                    return 'measures';
                }
                return null;
            })
            .filter((item: string) => item !== null)
            .join('/'),
        field: 'columnGroupLabel',
        children: columnHeaders,
        drillItems: []
    }] : columnHeaders;

    const rowHeaders: IGridHeader[]
        = getRowHeaders(dimensions[0].headers, columnDefOptions, makeRowGroups);

    // Add loading indicator to the first column
    if (addLoadingRenderer && rowHeaders.length > 0) {
        rowHeaders[0].cellRenderer = addLoadingRenderer;
    }

    // assign indexes
    const columnDefs: IGridHeader[] = [
        ...rowHeaders,
        ...groupColumnHeaders
    ].map((column, index) => {
        if (column.children) {
            // tslint:disable-next-line:variable-name
            getTreeLeaves(column).forEach((leafColumn, leafColumnIndex) => {
                leafColumn.index = index + leafColumnIndex;
            });
        }
        column.index = index;
        return column;
    });

    const columnFields: string[] = getFields(headerItems[1]);
    // PivotTable execution should always return a two-dimensional array (Execution.DataValue[][])
    const minimalRowData: Execution.DataValue[][] = getMinimalRowData(data as Execution.DataValue[][], headerItems[0]);
    const rowData = (minimalRowData).map(
        (dataRow: Execution.DataValue[], dataRowIndex: number) =>
            getRow(dataRow, dataRowIndex, columnFields, rowHeaders, headerItems[0])
    );

    return {
        columnDefs,
        rowData
    };
};
