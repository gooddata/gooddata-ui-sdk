// (C) 2007-2018 GoodData Corporation
import { Execution, AFM } from '@gooddata/typings';
import * as invariant from 'invariant';
import { getMappingHeaderName, getMappingHeaderUri } from './mappingHeader';
import range = require('lodash/range');
import get = require('lodash/get');
import clone = require('lodash/clone');
import zipObject = require('lodash/zipObject');

import { unwrap } from './utils';
import { IMappingHeader, isMappingHeaderTotal } from '../interfaces/MappingHeader';
import { IGridHeader, IColumnDefOptions, IGridRow, IGridAdapterOptions, IGridTotalsRow } from '../interfaces/AGGrid';
import { ColDef } from 'ag-grid';
import { getTreeLeaves } from '../components/core/PivotTable';
import InjectedIntl = ReactIntl.InjectedIntl;

export const ROW_ATTRIBUTE_COLUMN = 'ROW_ATTRIBUTE_COLUMN';
export const COLUMN_ATTRIBUTE_COLUMN = 'COLUMN_ATTRIBUTE_COLUMN';
export const MEASURE_COLUMN = 'MEASURE_COLUMN';
export const FIELD_SEPARATOR = '-';
export const FIELD_SEPARATOR_PLACEHOLDER = 'DASH';
export const FIELD_TYPE_MEASURE = 'm';
export const FIELD_TYPE_ATTRIBUTE = 'a';
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

    return get(
        measureGroupHeader,
        ['measureGroupHeader', 'items', header.measureHeaderItem.order], null
    );
};

export const assignDrillItemsAndType = (
    header: IGridHeader,
    currentHeader: Execution.IResultHeaderItem,
    responseHeaders: Execution.IHeader[],
    headerIndex: number,
    drillItems: IMappingHeader[]
) => {
    if (Execution.isAttributeHeaderItem(currentHeader)) {
        header.type = COLUMN_ATTRIBUTE_COLUMN;
        // attribute value uri
        drillItems.push(currentHeader);
        // attribute uri and identifier
        const attributeResponseHeader =
            responseHeaders[headerIndex % responseHeaders.length] as Execution.IAttributeHeader;
        drillItems.push(attributeResponseHeader);
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

export const shouldMergeHeaders = (
    resultHeaderDimension: Execution.IResultHeaderItem[][],
    headerIndex: number,
    headerItemIndex: number
): boolean => {
    for (let ancestorIndex = headerIndex; ancestorIndex >= 0; ancestorIndex--) {
        const currentAncestorHeader = resultHeaderDimension[ancestorIndex][headerItemIndex];
        const nextAncestorHeader = resultHeaderDimension[ancestorIndex][headerItemIndex + 1];
        if (
            !nextAncestorHeader
            || identifyHeader(currentAncestorHeader) !== identifyHeader(nextAncestorHeader)
        ) {
            return false;
        }
    }
    return true;
};

export const mergeHeaderEndIndex = (
    resultHeaderDimension: Execution.IResultHeaderItem[][],
    headerIndex: number,
    headerItemStartIndex: number
): number => {
    const header = resultHeaderDimension[headerIndex];
    for (let headerItemIndex = headerItemStartIndex; headerItemIndex < header.length; headerItemIndex++) {
        if (!shouldMergeHeaders(resultHeaderDimension, headerIndex, headerItemIndex)) {
            return headerItemIndex;
        }
    }
    return headerItemStartIndex;
};

/*
 * getColumnHeaders transforms header items from matrix to tree hierarchy
 * for each span of identical headers in a row, the function is called recursively to assign child items
 */
export const getColumnHeaders = (
    resultHeaderDimension: Execution.IResultHeaderItem[][],
    responseHeaders: Execution.IHeader[],
    columnDefOptions: IColumnDefOptions = {},
    headerIndex = 0,
    headerItemStartIndex = 0,
    headerValueEnd: number = undefined,
    fieldPrefix = '',
    parentDrillItems: IMappingHeader[] = []
): IGridHeader[] => {
    if (!resultHeaderDimension.length) {
        return [];
    }

    const currentHeaders = resultHeaderDimension[headerIndex];
    const lastIndex = headerValueEnd !== undefined ? headerValueEnd : currentHeaders.length - 1;
    const hierarchy: IGridHeader[] = [];

    for (let headerItemIndex = headerItemStartIndex; (headerItemIndex < lastIndex + 1);) {
        const currentHeader = currentHeaders[headerItemIndex];
        const header: IGridHeader = {
            drillItems: [],
            ...headerToGrid(currentHeader, fieldPrefix),
            ...columnDefOptions
        };
        const drillItems: IMappingHeader[] = clone(parentDrillItems);
        assignDrillItemsAndType(header, currentHeader, responseHeaders, headerIndex, drillItems);
        const headerItemEndIndex = mergeHeaderEndIndex(
            resultHeaderDimension,
            headerIndex,
            headerItemIndex
        );

        if (headerIndex !== resultHeaderDimension.length - 1) {
            header.children = getColumnHeaders(
                resultHeaderDimension,
                responseHeaders,
                columnDefOptions,
                headerIndex + 1,
                headerItemIndex,
                headerItemEndIndex,
                header.field + FIELD_SEPARATOR,
                drillItems
            );
        }
        hierarchy.push(header);
        // We move the pointer manually to skip identical headers
        headerItemIndex = headerItemEndIndex + 1;
    }

    return hierarchy;
};

export const getRowHeaders = (
    rowDimensionHeaders: Execution.IAttributeHeader[],
    columnDefOptions: IColumnDefOptions,
    makeRowGroups: boolean
): IGridHeader[] => {
    return rowDimensionHeaders.map((attributeHeader: Execution.IAttributeHeader) => {
        const rowGroupProps = makeRowGroups ? {
            rowGroup: true,
            hide: true
        } : {};
        const field = identifyResponseHeader(attributeHeader);
        return {
            // The label should be attribute name (not attribute display form name)
            headerName: getMappingHeaderName(attributeHeader),
            type: ROW_ATTRIBUTE_COLUMN,
            // Row dimension must contain only attribute headers.
            field,
            drillItems: [attributeHeader],
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

const getSubtotalLabelCellIndex = (resultHeaderItems: Execution.IResultHeaderItem[][], rowIndex: number): number => {
    return resultHeaderItems.findIndex(headerItem => Execution.isTotalHeaderItem(headerItem[rowIndex]));
};

const getCell = (
    rowHeaderData: Execution.IResultHeaderItem[][],
    rowIndex: number,
    rowHeader: IGridHeader,
    rowHeaderIndex: number,
    intl: InjectedIntl
): {
    field: string,
    value: string,
    rowHeaderDataItem: Execution.IResultHeaderItem
} => {
    const rowHeaderDataItem = rowHeaderData[rowHeaderIndex][rowIndex];
    const cell = {
        field: rowHeader.field,
        rowHeaderDataItem
    };

    if (Execution.isAttributeHeaderItem(rowHeaderDataItem)) {
        return {
            ...cell,
            value: rowHeaderDataItem.attributeHeaderItem.name
        };
    }

    if (Execution.isTotalHeaderItem(rowHeaderDataItem)) {
        const totalName = rowHeaderDataItem.totalHeaderItem.name;
        return {
            ...cell,
            value: getSubtotalLabelCellIndex(rowHeaderData, rowIndex) === rowHeaderIndex
                ? intl.formatMessage({ id: `visualizations.totals.dropdown.title.${totalName}` })
                : null
        };
    }

    invariant(rowHeaderDataItem, 'row header is not of type IResultAttributeHeaderItem or IResultTotalHeaderItem');
};

export const getRow = (
    cellData: Execution.DataValue[],
    rowIndex: number,
    columnFields: string[],
    rowHeaders: IGridHeader[],
    rowHeaderData: Execution.IResultHeaderItem[][],
    intl: InjectedIntl
): IGridRow => {
    const row: IGridRow = {
        headerItemMap: {}
    };

    rowHeaders.forEach((rowHeader, rowHeaderIndex) => {
        const { field, value, rowHeaderDataItem } = getCell(rowHeaderData, rowIndex, rowHeader, rowHeaderIndex, intl);
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
    intl: InjectedIntl
): IGridTotalsRow[] => {
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

export interface IAgGridPage {
    columnDefs: IGridHeader[];
    rowData: IGridRow[];
    rowTotals: IGridTotalsRow[];
}

export const executionToAGGridAdapter = (
    executionResponses: Execution.IExecutionResponses,
    resultSpec: AFM.IResultSpec = {},
    intl: InjectedIntl,
    options: IGridAdapterOptions = {}
): IAgGridPage => {
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
            .filter(header => Execution.isAttributeHeader(header))
            .map((header: Execution.IAttributeHeader) => {
                return getMappingHeaderName(header);
            })
            .filter((item: string) => item !== null)
            .join(' › '),
        field: 'columnGroupLabel',
        children: columnHeaders,
        drillItems: []
    }] : columnHeaders;

    const rowHeaders: IGridHeader[]
        // There are supposed to be only attribute headers on the first dimension
        = getRowHeaders(dimensions[0].headers as Execution.IAttributeHeader[], columnDefOptions, makeRowGroups);

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
            getRow(dataRow, dataRowIndex, columnFields, rowHeaders, headerItems[0], intl)
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

export const getRowNodeId = (item: any) => {
    return Object.keys(item.headerItemMap).map((key) => {
        const mappingHeader: IMappingHeader = item.headerItemMap[key];

        if (isMappingHeaderTotal(mappingHeader)) {
            return `${key}${ID_SEPARATOR}${mappingHeader.totalHeaderItem.name}`;
        }

        const uri = getMappingHeaderUri(mappingHeader);
        const ids = getIdsFromUri(uri);
        return `${key}${ID_SEPARATOR}${ids[1]}`;
    }).join(FIELD_SEPARATOR);
};
