// (C) 2007-2019 GoodData Corporation

import { Execution } from "@gooddata/typings";
import { getMappingHeaderName } from "../../../helpers/mappingHeader";
import { unwrap } from "../../../helpers/utils";
import { IMappingHeader } from "../../../interfaces/MappingHeader";
import { getIdsFromUri } from "./agGridUtils";
import range = require("lodash/range");
import clone = require("lodash/clone");
import { FIELD_SEPARATOR, ID_SEPARATOR, ROW_ATTRIBUTE_COLUMN } from "./agGridConst";
import { assignDrillItemsAndType } from "./agGridDrilling";
import { IColumnDefOptions, IGridHeader } from "./agGridTypes";
import invariant = require("invariant");

/*
 * All code related to transforming headers from our backend to ag-grid specific data structures
 */

export const identifyHeader = (header: Execution.IResultHeaderItem) => {
    if (Execution.isAttributeHeaderItem(header)) {
        return `a${ID_SEPARATOR}${getIdsFromUri(header.attributeHeaderItem.uri).join(ID_SEPARATOR)}`;
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
        return `a${ID_SEPARATOR}${getIdsFromUri(header.attributeHeader.uri)[0]}`;
    }
    if (Execution.isMeasureGroupHeader(header)) {
        // trying to identify a measure group would be ambiguous
        return null;
    }
    invariant(false, `Unknown response header type: ${JSON.stringify(header)}`);
};

export const headerToGrid = (header: Execution.IResultHeaderItem, fieldPrefix = "") => {
    const internalHeader = unwrap(header);
    return {
        headerName: internalHeader.name,
        field: fieldPrefix + identifyHeader(header),
    };
};

export const shouldMergeHeaders = (
    resultHeaderDimension: Execution.IResultHeaderItem[][],
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
    resultHeaderDimension: Execution.IResultHeaderItem[][],
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
    resultHeaderDimension: Execution.IResultHeaderItem[][],
    responseHeaders: Execution.IHeader[],
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
    rowDimensionHeaders: Execution.IAttributeHeader[],
    columnDefOptions: IColumnDefOptions,
    makeRowGroups: boolean,
): IGridHeader[] => {
    return rowDimensionHeaders.map((attributeHeader: Execution.IAttributeHeader) => {
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

export const getFields = (dataHeaders: Execution.IResultHeaderItem[][]) => {
    return range((dataHeaders[0] || []).length).map((cellIndex: number) => {
        const fieldList = dataHeaders.map((header: Execution.IResultHeaderItem[]) =>
            identifyHeader(header[cellIndex]),
        );
        return fieldList.join(FIELD_SEPARATOR);
    }) as string[];
};

export const assortDimensionHeaders = (dimensions: Execution.IResultDimension[]) => {
    const dimensionHeaders: Execution.IHeader[] = dimensions.reduce(
        (headers: Execution.IHeader[], dimension: Execution.IResultDimension) => [
            ...headers,
            ...dimension.headers,
        ],
        [],
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
        measureHeaderItems,
    };
};

export const getMinimalRowData = (
    data: Execution.DataValue[][],
    rowHeaderItems: Execution.IResultHeaderItem[][],
) => {
    const numberOfRowHeaderItems = (rowHeaderItems[0] || []).length;

    return data.length > 0
        ? data
        : // if there are no measures only attributes
          // create array of [null] of length equal to the number of row dimension headerItems
          (Array(numberOfRowHeaderItems).fill([null]) as Execution.DataValue[][]);
};
