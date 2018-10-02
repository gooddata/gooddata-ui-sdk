// (C) 2007-2018 GoodData Corporation
import { Execution, AFM } from '@gooddata/typings';
import * as invariant from 'invariant';
import range = require('lodash/range');
import get = require('lodash/get');
import zipObject = require('lodash/zipObject');

import { unwrap } from './utils';
import { IDrillItem } from '../interfaces/DrillEvents';
import { IGridHeader, IColumnDefOptions, IGridRow, IGridAdapterOptions } from '../interfaces/AGGrid';
import { ColDef } from 'ag-grid';
import { getTreeLeaves } from '../components/core/PivotTable';
import InjectedIntl = ReactIntl.InjectedIntl;

export const ROW_ATTRIBUTE_COLUMN = 'ROW_ATTRIBUTE_COLUMN';
export const COLUMN_ATTRIBUTE_COLUMN = 'COLUMN_ATTRIBUTE_COLUMN';
export const MEASURE_COLUMN = 'MEASURE_COLUMN';
export const FIELD_SEPARATOR = '-';
export const FIELD_SEPARATOR_PLACEHOLDER = 'DASH';
export const ID_SEPARATOR = '_';
export const ID_SEPARATOR_PLACEHOLDER = 'UNDERSCORE';
export const DOT_PLACEHOLDER = 'DOT';
export const ROW_TOTAL = 'rowTotal';

export const sanitizeField = (field: string) => (
    // Identifiers can not contain a dot character, because AGGrid cannot handle it.
    // Alternatively, we could handle it with a custom renderer (works in RowLoadingElement).
    field
        .replace(/\./g, DOT_PLACEHOLDER)
        .replace(new RegExp(FIELD_SEPARATOR, 'g'), FIELD_SEPARATOR_PLACEHOLDER)
        .replace(new RegExp(ID_SEPARATOR, 'g'), ID_SEPARATOR_PLACEHOLDER)
);

// returns [attributeId, attributeValueId]
// attributeValueId can be null if supplied with attribute uri instead of attribute value uri
export const getIdsFromUri = (uri: string, sanitize = true) => {
    const [, attributeId, , attributeValueId = null] = uri.match(/obj\/([^\/]*)(\/elements\?id=)?(.*)?$/);
    return [attributeId, attributeValueId].map((id: string | null) => ((id && sanitize) ? sanitizeField(id) : id));
};

export const identifyHeader = (header: Execution.IResultHeaderItem) => {
    if (Execution.isAttributeHeaderItem(header)) {
        return `a_${getIdsFromUri(header.attributeHeaderItem.uri).join(ID_SEPARATOR)}`;
    }
    if (Execution.isMeasureHeaderItem(header)) {
        return `m${ID_SEPARATOR}${header.measureHeaderItem.order}`;
    }
    if (Execution.isTotalHeaderItem(header)) {
        return `t${ID_SEPARATOR}${header.totalHeaderItem.type}`;
    }
    invariant(false, `Unknown header type: ${JSON.stringify(header)}`);
};

export const identifyResponseHeader = (header: Execution.IHeader) => {
    if (Execution.isAttributeHeader(header)) {
        // response headers have no value id
        return `a_${getIdsFromUri(header.attributeHeader.uri)[0]}`;
    }
    if (Execution.isMeasureGroupHeader(header)) {
        // trying to identify a measure group would be ambiguous
        return null;
    }
    invariant(false, `Unknown response header type: ${JSON.stringify(header)}`);
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
            currentHeaders[index + 1] && header.field === (fieldPrefix + identifyHeader(currentHeaders[index + 1]))
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
        const field = identifyResponseHeader(headerItemWrapped);
        return {
            headerName: headerItem.name,
            type: ROW_ATTRIBUTE_COLUMN,
            // Row dimension must contain only attribute headers.
            field,
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

export const getRowTotals = (
    totals: Execution.DataValue[][][],
    columnKeys: string[],
    headers: Execution.IHeader[],
    intl: InjectedIntl
) => {
    if (!totals) {
        return null;
    }

    return totals[0].map((totalRow: string[], totalIndex: number) => {
        const attributeKeys: string[] = [];
        const measureKeys: string[] = [];

        // assort keys by type
        columnKeys.filter((key: any) => {
            const currentKey = key.split(FIELD_SEPARATOR).pop();
            const fieldType = currentKey.split(ID_SEPARATOR)[0];
            if (fieldType === 'a') {
                attributeKeys.push(currentKey);
            }
            if (fieldType === 'm') {
                measureKeys.push(key);
            }
        });

        const [totalAttributeKey] = attributeKeys;
        const totalAttributeId: string = totalAttributeKey.split(ID_SEPARATOR).pop();

        const totalHeader: Execution.IAttributeHeader = headers.find(
            (header: Execution.IHeader) => Execution.isAttributeHeader(header)
                && getIdsFromUri(header.attributeHeader.uri)[0] === totalAttributeId
        ) as Execution.IAttributeHeader;

        invariant(totalHeader, `Could not find header for ${totalAttributeKey}`);

        const measureCells = zipObject(measureKeys, totalRow);

        const totalName = totalHeader.attributeHeader.totalItems[totalIndex].totalHeaderItem.name;

        return {
            colSpan: {
                count: attributeKeys.length,
                headerKey: totalAttributeKey
            },
            ...measureCells,
            [totalAttributeKey]: intl.formatMessage({ id: `visualizations.totals.dropdown.title.${totalName}` }),
            type: {
                [ROW_TOTAL]: true
            }
        };
    });
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

export const assortDimensionHeaders = (dimensions: Execution.IResultDimension[]) => {
    const dimensionHeaders: Execution.IHeader[] = dimensions.reduce(
        (headers: Execution.IHeader[], dimension: Execution.IResultDimension) => (
            [...headers, ...dimension.headers]
        ),
        []
    );
    const attributeHeaders: Execution.IAttributeHeader[] = [];
    const measureHeaderItems: Execution.IMeasureHeaderItem[] = [];
    dimensionHeaders.forEach((dimensionHeader: Execution.IHeader) => {
        if (Execution.isAttributeHeader(dimensionHeader)) {
            attributeHeaders.push(dimensionHeader);
        } else if (Execution.isMeasureGroupHeader(dimensionHeader)) {
            measureHeaderItems.push(...dimensionHeader.measureGroupHeader.items);
        }
    });
    return {
        attributeHeaders,
        measureHeaderItems
    };
};

export const assignSorting = (colDef: ColDef, sortingMap: {[key: string]: string}): void => {
    const direction = sortingMap[colDef.field];
    if (direction) {
        colDef.sort = direction;
    }
};

export const getAttributeSortItemFieldAndDirection = (
    sortItem: AFM.IAttributeSortItem,
    attributeHeaders: Execution.IAttributeHeader[]
): [string, string] => {
    const localIdentifier = sortItem.attributeSortItem.attributeIdentifier;

    const sortHeader = attributeHeaders
        .find(header => header.attributeHeader.localIdentifier === localIdentifier);
    invariant(sortHeader, `Could not find sortHeader with localIdentifier ${localIdentifier}`);

    const field = identifyResponseHeader(sortHeader);
    return [field, sortItem.attributeSortItem.direction];
};

export const getMeasureSortItemFieldAndDirection = (
    sortItem: AFM.IMeasureSortItem,
    measureHeaderItems: Execution.IMeasureHeaderItem[]
): [string, string] => {
    const keys: string[] = [];
    sortItem.measureSortItem.locators.map((locator) => {
        if (AFM.isMeasureLocatorItem(locator)) {
            const measureSortHeaderIndex = measureHeaderItems
                .findIndex(measureHeaderItem => measureHeaderItem.measureHeaderItem.localIdentifier
                    === locator.measureLocatorItem.measureIdentifier);
            keys.push(`m_${measureSortHeaderIndex}`);
        } else {
            const key = `a_${getIdsFromUri(locator.attributeLocatorItem.element).join(ID_SEPARATOR)}`;
            keys.push(key);
        }
    });
    const field = keys.join(FIELD_SEPARATOR);
    const direction = sortItem.measureSortItem.direction;
    return [field, direction];
};

export const executionToAGGridAdapter = (
    executionResponses: Execution.IExecutionResponses,
    resultSpec: AFM.IResultSpec = {},
    intl: InjectedIntl,
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
            headerItems,
            totals
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

    // build sortingMap from resultSpec.sorts
    const sorting = resultSpec.sorts || [];
    const sortingMap = {};
    const { attributeHeaders, measureHeaderItems } = assortDimensionHeaders(dimensions);
    sorting.forEach((sortItem) => {
        if (AFM.isAttributeSortItem(sortItem)) {
            const [field, direction] = getAttributeSortItemFieldAndDirection(sortItem, attributeHeaders);
            sortingMap[field] = direction;
        }
        if (AFM.isMeasureSortItem(sortItem)) {
            const [field, direction] = getMeasureSortItemFieldAndDirection(sortItem, measureHeaderItems);
            sortingMap[field] = direction;
        }
    });
    // assign sorting and indexes
    const columnDefs: IGridHeader[] = [
        ...rowHeaders,
        ...groupColumnHeaders
    ].map((column, index) => {
        if (column.children) {
            getTreeLeaves(column).forEach((leafColumn, leafColumnIndex) => {
                leafColumn.index = index + leafColumnIndex;
                assignSorting(leafColumn, sortingMap);
            });
        }
        column.index = index;
        assignSorting(column, sortingMap);
        return column;
    });

    // Add loading indicator to the first column
    if (addLoadingRenderer) {
        const leafColumnDefs = getTreeLeaves(columnDefs);
        if (leafColumnDefs.length > 0) {
            leafColumnDefs[0].cellRenderer = addLoadingRenderer;
        }
    }

    const columnFields: string[] = getFields(headerItems[1]);
    const rowFields: string[] = rowHeaders.map(header => header.field);
    // PivotTable execution should always return a two-dimensional array (Execution.DataValue[][])
    const minimalRowData: Execution.DataValue[][] = getMinimalRowData(data as Execution.DataValue[][], headerItems[0]);
    const rowData = (minimalRowData).map(
        (dataRow: Execution.DataValue[], dataRowIndex: number) =>
            getRow(dataRow, dataRowIndex, columnFields, rowHeaders, headerItems[0])
    );

    const columnKeys = [...rowFields, ...columnFields];
    const rowTotals = getRowTotals(totals, columnKeys, dimensions[0].headers, intl);

    return {
        columnDefs,
        rowData,
        rowTotals
    };
};

export const getParsedFields = (colId: string): string[][] => {
    // supported colIds are 'a_2009', 'a_2009_4-a_2071_12', 'a_2009_4-a_2071_12-m_3'
    return colId
        .split(FIELD_SEPARATOR)
        .map((field: string) => (field.split(ID_SEPARATOR)));
};
