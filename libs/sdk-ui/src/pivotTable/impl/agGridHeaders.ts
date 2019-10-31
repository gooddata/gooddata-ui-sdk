// (C) 2007-2019 GoodData Corporation

import { getMappingHeaderName } from "../../base/helpers/mappingHeader";
import { unwrap } from "../../base/helpers/utils";
import { IMappingHeader } from "../../base/interfaces/MappingHeader";
import { getIdsFromUri, getTreeLeaves } from "./agGridUtils";
import {
    COLUMN_GROUPING_DELIMITER,
    FIELD_SEPARATOR,
    ID_SEPARATOR,
    ROW_ATTRIBUTE_COLUMN,
} from "./agGridConst";
import { assignDrillItemsAndType } from "./agGridDrilling";
import { IColumnDefOptions, IGridAdapterOptions, IGridHeader, TableHeaders } from "./agGridTypes";
import {
    DataValue,
    DataViewFacade,
    IAttributeDescriptor,
    IDataView,
    IDimensionItemDescriptor,
    IMeasureDescriptor,
    IDimensionDescriptor,
    IResultHeader,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isResultTotalHeader,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeSortItem,
    IMeasureSortItem,
    isAttributeSort,
    isMeasureLocator,
    isMeasureSort,
} from "@gooddata/sdk-model";
import { ColDef } from "ag-grid-community";
import range = require("lodash/range");
import clone = require("lodash/clone");
import invariant = require("invariant");

/*
 * All code related to transforming headers from our backend to ag-grid specific data structures
 */

export const identifyHeader = (header: IResultHeader) => {
    if (isResultAttributeHeader(header)) {
        return `a${ID_SEPARATOR}${getIdsFromUri(header.attributeHeaderItem.uri).join(ID_SEPARATOR)}`;
    }
    if (isResultMeasureHeader(header)) {
        return `m${ID_SEPARATOR}${header.measureHeaderItem.order}`;
    }
    if (isResultTotalHeader(header)) {
        return `t${ID_SEPARATOR}${header.totalHeaderItem.type}`;
    }
    invariant(false, `Unknown header type: ${JSON.stringify(header)}`);
};

export const identifyResponseHeader = (header: IDimensionItemDescriptor) => {
    if (isAttributeDescriptor(header)) {
        // response headers have no value id
        return `a${ID_SEPARATOR}${getIdsFromUri(header.attributeHeader.uri)[0]}`;
    }
    if (isMeasureGroupDescriptor(header)) {
        // trying to identify a measure group would be ambiguous
        return null;
    }
    invariant(false, `Unknown response header type: ${JSON.stringify(header)}`);
};

export const headerToGrid = (header: IResultHeader, fieldPrefix = "") => {
    const internalHeader = unwrap(header);
    return {
        headerName: internalHeader.name,
        field: fieldPrefix + identifyHeader(header),
    };
};

export const shouldMergeHeaders = (
    resultHeaderDimension: IResultHeader[][],
    headerIndex: number,
    headerItemIndex: number,
): boolean => {
    for (let ancestorIndex = headerIndex; ancestorIndex >= 0; ancestorIndex--) {
        const currentAncestorHeader = resultHeaderDimension[ancestorIndex][headerItemIndex];
        const nextAncestorHeader = resultHeaderDimension[ancestorIndex][headerItemIndex + 1];
        if (
            !nextAncestorHeader ||
            identifyHeader(currentAncestorHeader) !== identifyHeader(nextAncestorHeader)
        ) {
            return false;
        }
    }
    return true;
};

export const mergeHeaderEndIndex = (
    resultHeaderDimension: IResultHeader[][],
    headerIndex: number,
    headerItemStartIndex: number,
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
    resultHeaderDimension: IResultHeader[][],
    responseHeaders: IDimensionItemDescriptor[],
    columnDefOptions: IColumnDefOptions = {},
    headerIndex = 0,
    headerItemStartIndex = 0,
    headerValueEnd: number = undefined,
    fieldPrefix = "",
    parentDrillItems: IMappingHeader[] = [],
): IGridHeader[] => {
    if (!resultHeaderDimension.length) {
        return [];
    }

    const currentHeaders = resultHeaderDimension[headerIndex];
    const lastIndex = headerValueEnd !== undefined ? headerValueEnd : currentHeaders.length - 1;
    const hierarchy: IGridHeader[] = [];

    for (let headerItemIndex = headerItemStartIndex; headerItemIndex < lastIndex + 1; ) {
        const currentHeader = currentHeaders[headerItemIndex];
        const header: IGridHeader = {
            drillItems: [],
            ...headerToGrid(currentHeader, fieldPrefix),
            ...columnDefOptions,
        };
        const drillItems: IMappingHeader[] = clone(parentDrillItems);
        assignDrillItemsAndType(header, currentHeader, responseHeaders, headerIndex, drillItems);
        const headerItemEndIndex = mergeHeaderEndIndex(resultHeaderDimension, headerIndex, headerItemIndex);

        if (headerIndex !== resultHeaderDimension.length - 1) {
            header.children = getColumnHeaders(
                resultHeaderDimension,
                responseHeaders,
                columnDefOptions,
                headerIndex + 1,
                headerItemIndex,
                headerItemEndIndex,
                header.field + FIELD_SEPARATOR,
                drillItems,
            );
        }
        hierarchy.push(header);
        // We move the pointer manually to skip identical headers
        headerItemIndex = headerItemEndIndex + 1;
    }

    return hierarchy;
};

export const getRowHeaders = (
    rowDimensionHeaders: IAttributeDescriptor[],
    columnDefOptions: IColumnDefOptions,
    makeRowGroups: boolean,
): IGridHeader[] => {
    return rowDimensionHeaders.map((attributeHeader: IAttributeDescriptor) => {
        const rowGroupProps = makeRowGroups
            ? {
                  rowGroup: true,
                  hide: true,
              }
            : {};
        const field = identifyResponseHeader(attributeHeader);
        return {
            // The label should be attribute name (not attribute display form name)
            headerName: getMappingHeaderName(attributeHeader),
            type: ROW_ATTRIBUTE_COLUMN,
            // Row dimension must contain only attribute headers.
            field,
            drillItems: [attributeHeader],
            ...rowGroupProps,
            ...columnDefOptions,
        };
    });
};

export const getFields = (dataHeaders: IResultHeader[][]) => {
    return range((dataHeaders[0] || []).length).map((cellIndex: number) => {
        const fieldList = dataHeaders.map((header: IResultHeader[]) => identifyHeader(header[cellIndex]));
        return fieldList.join(FIELD_SEPARATOR);
    }) as string[];
};

// TODO: move this to data view facade / sanitize / make more generic
export const assortDimensionHeaders = (dimensions: IDimensionDescriptor[]) => {
    const dimensionHeaders: IDimensionItemDescriptor[] = dimensions.reduce(
        (headers: IDimensionItemDescriptor[], dimension: IDimensionDescriptor) => [
            ...headers,
            ...dimension.headers,
        ],
        [],
    );
    const attributeHeaders: IAttributeDescriptor[] = [];
    const measureHeaderItems: IMeasureDescriptor[] = [];
    dimensionHeaders.forEach((dimensionHeader: IDimensionItemDescriptor) => {
        if (isAttributeDescriptor(dimensionHeader)) {
            attributeHeaders.push(dimensionHeader);
        } else if (isMeasureGroupDescriptor(dimensionHeader)) {
            measureHeaderItems.push(...dimensionHeader.measureGroupHeader.items);
        }
    });
    return {
        attributeHeaders,
        measureHeaderItems,
    };
};

export const getMinimalRowData = (data: DataValue[][], rowHeaderItems: IResultHeader[][]) => {
    const numberOfRowHeaderItems = (rowHeaderItems[0] || []).length;

    return data.length > 0
        ? data
        : // if there are no measures only attributes
          // create array of [null] of length equal to the number of row dimension headerItems
          (Array(numberOfRowHeaderItems).fill([null]) as DataValue[][]);
};

const assignSorting = (colDef: ColDef, sortingMap: { [key: string]: string }): void => {
    const direction = sortingMap[colDef.field];
    if (direction) {
        colDef.sort = direction;
    }
};

/**
 * exported due to tests
 * @internal
 */
export const getAttributeSortItemFieldAndDirection = (
    sortItem: IAttributeSortItem,
    attributeHeaders: IAttributeDescriptor[],
): [string, string] => {
    const localIdentifier = sortItem.attributeSortItem.attributeIdentifier;

    const sortHeader = attributeHeaders.find(
        header => header.attributeHeader.localIdentifier === localIdentifier,
    );
    invariant(sortHeader, `Could not find sortHeader with localIdentifier ${localIdentifier}`);

    const field = identifyResponseHeader(sortHeader);
    return [field, sortItem.attributeSortItem.direction];
};

/**
 * exported due to tests
 * @internal
 */
export const getMeasureSortItemFieldAndDirection = (
    sortItem: IMeasureSortItem,
    measureHeaderItems: IMeasureDescriptor[],
): [string, string] => {
    const keys: string[] = [];
    sortItem.measureSortItem.locators.forEach(locator => {
        if (isMeasureLocator(locator)) {
            const measureSortHeaderIndex = measureHeaderItems.findIndex(
                measureHeaderItem =>
                    measureHeaderItem.measureHeaderItem.localIdentifier ===
                    locator.measureLocatorItem.measureIdentifier,
            );
            keys.push(`m${ID_SEPARATOR}${measureSortHeaderIndex}`);
        } else {
            const key = `a${ID_SEPARATOR}${getIdsFromUri(locator.attributeLocatorItem.element).join(
                ID_SEPARATOR,
            )}`;
            keys.push(key);
        }
    });
    const field = keys.join(FIELD_SEPARATOR);
    const direction = sortItem.measureSortItem.direction;
    return [field, direction];
};

export function createTableHeaders(dataView: IDataView, options: IGridAdapterOptions = {}): TableHeaders {
    const dv = new DataViewFacade(dataView);
    const dimensions = dv.dimensions();
    const headerItems = dv.headerItems();
    const { columnDefOptions, makeRowGroups = false } = options;

    const sorting = dv.definition.sortBy;
    const sortingMap = {};
    const { attributeHeaders, measureHeaderItems } = assortDimensionHeaders(dimensions);
    sorting.forEach(sortItem => {
        if (isAttributeSort(sortItem)) {
            const [field, direction] = getAttributeSortItemFieldAndDirection(sortItem, attributeHeaders);
            sortingMap[field] = direction;
        }
        if (isMeasureSort(sortItem)) {
            const [field, direction] = getMeasureSortItemFieldAndDirection(sortItem, measureHeaderItems);
            sortingMap[field] = direction;
        }
    });

    const columnAttributeHeaderCount = dimensions[1].headers.filter(
        (header: IDimensionItemDescriptor) => !!(header as IAttributeDescriptor).attributeHeader,
    ).length;

    const columnHeaders: IGridHeader[] = getColumnHeaders(
        headerItems[1],
        dimensions[1].headers,
        columnDefOptions,
    );

    const groupColumnHeaders: IGridHeader[] =
        columnAttributeHeaderCount > 0
            ? [
                  {
                      headerName: dimensions[1].headers
                          .filter(header => isAttributeDescriptor(header))
                          .map((header: IAttributeDescriptor) => {
                              return getMappingHeaderName(header);
                          })
                          .filter((item: string) => item !== null)
                          .join(COLUMN_GROUPING_DELIMITER),
                      field: "columnGroupLabel",
                      children: columnHeaders,
                      drillItems: [],
                  },
              ]
            : columnHeaders;

    const rowHeaders: IGridHeader[] =
        // There are supposed to be only attribute headers on the first dimension
        getRowHeaders(dimensions[0].headers as IAttributeDescriptor[], columnDefOptions, makeRowGroups);

    const allHeaders: IGridHeader[] = [...rowHeaders, ...groupColumnHeaders].map((column, index) => {
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

    const colFields: string[] = getFields(headerItems[1]);
    const rowFields: string[] = rowHeaders.map(header => header.field);

    const leafColumnDefs = getTreeLeaves(allHeaders);
    if (leafColumnDefs[0]) {
        leafColumnDefs[0].cellRenderer = "loadingRenderer";
    }

    return {
        rowHeaders,
        colHeaders: groupColumnHeaders,
        allHeaders,
        rowFields,
        colFields,
    };
}
