// (C) 2007-2019 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { getIdsFromUri, getParsedFields } from "./agGridUtils";
import {
    FIELD_SEPARATOR,
    FIELD_TYPE_ATTRIBUTE,
    FIELD_TYPE_MEASURE,
    ID_SEPARATOR,
    ROW_ATTRIBUTE_COLUMN,
} from "./agGridConst";
import { assortDimensionHeaders, identifyResponseHeader } from "./agGridHeaders";
import { ISortedByColumnIndexes, ISortModelItem } from "./agGridTypes";
import invariant = require("invariant");
import { ColDef } from "ag-grid-community";

/*
 * All code related to sorting the ag-grid backed Pivot Table is concentrated here
 */

export const getAttributeSortItemFieldAndDirection = (
    sortItem: AFM.IAttributeSortItem,
    attributeHeaders: Execution.IAttributeHeader[],
): [string, string] => {
    const localIdentifier = sortItem.attributeSortItem.attributeIdentifier;

    const sortHeader = attributeHeaders.find(
        header => header.attributeHeader.localIdentifier === localIdentifier,
    );
    invariant(sortHeader, `Could not find sortHeader with localIdentifier ${localIdentifier}`);

    const field = identifyResponseHeader(sortHeader);
    return [field, sortItem.attributeSortItem.direction];
};

export const getMeasureSortItemFieldAndDirection = (
    sortItem: AFM.IMeasureSortItem,
    measureHeaderItems: Execution.IMeasureHeaderItem[],
): [string, string] => {
    const keys: string[] = [];
    sortItem.measureSortItem.locators.forEach(locator => {
        if (AFM.isMeasureLocatorItem(locator)) {
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

export const getSortItemByColId = (
    execution: Execution.IExecutionResponses,
    colId: string,
    direction: AFM.SortDirection,
): AFM.IMeasureSortItem | AFM.IAttributeSortItem => {
    const { dimensions } = execution.executionResponse;

    const fields = getParsedFields(colId);
    const [lastFieldType, lastFieldId] = fields[fields.length - 1];

    // search columns first when sorting in columns to use the proper header
    // in case the same attribute is in both rows and columns
    const searchDimensionIndex = lastFieldType === FIELD_TYPE_MEASURE ? 1 : 0;
    const { attributeHeaders, measureHeaderItems } = assortDimensionHeaders([
        dimensions[searchDimensionIndex],
    ]);

    if (lastFieldType === FIELD_TYPE_ATTRIBUTE) {
        for (const header of attributeHeaders) {
            if (getIdsFromUri(header.attributeHeader.uri)[0] === lastFieldId) {
                return {
                    attributeSortItem: {
                        direction,
                        attributeIdentifier: header.attributeHeader.localIdentifier,
                    },
                };
            }
        }
        invariant(false, `could not find attribute header matching ${colId}`);
    } else if (lastFieldType === FIELD_TYPE_MEASURE) {
        const headerItem = measureHeaderItems[parseInt(lastFieldId, 10)];
        const attributeLocators = fields.slice(0, -1).map((field: string[]) => {
            // first item is type which should be always 'a'
            const [, fieldId, fieldValueId] = field;
            const attributeHeaderMatch = attributeHeaders.find(
                (attributeHeader: Execution.IAttributeHeader) => {
                    return getIdsFromUri(attributeHeader.attributeHeader.formOf.uri)[0] === fieldId;
                },
            );
            invariant(
                attributeHeaderMatch,
                `Could not find matching attribute header to field ${field.join(ID_SEPARATOR)}`,
            );
            return {
                attributeLocatorItem: {
                    attributeIdentifier: attributeHeaderMatch.attributeHeader.localIdentifier,
                    element: `${attributeHeaderMatch.attributeHeader.formOf.uri}/elements?id=${fieldValueId}`,
                },
            };
        });
        return {
            measureSortItem: {
                direction,
                locators: [
                    ...attributeLocators,
                    {
                        measureLocatorItem: {
                            measureIdentifier: headerItem.measureHeaderItem.localIdentifier,
                        },
                    },
                ],
            },
        };
    }
    invariant(false, `could not find header matching ${colId}`);
};

export function isSortedByFirstAttibute(columnDefs: ColDef[], resultSpec: AFM.IResultSpec): boolean {
    const sortedColumnIndexes: ISortedByColumnIndexes = columnDefs.reduce(
        (sortStack: ISortedByColumnIndexes, columnDef: ColDef, columnIndex: number) => {
            if (columnDef.sort) {
                sortStack.all.push(columnIndex);
                if (columnDef.type === ROW_ATTRIBUTE_COLUMN) {
                    sortStack.attributes.push(columnIndex);
                }
            }
            return sortStack;
        },
        { attributes: [], all: [] },
    );

    const sortedByFirstAttribute =
        sortedColumnIndexes.attributes[0] === 0 && sortedColumnIndexes.all.length === 1;
    const isSorted =
        sortedColumnIndexes.all.length > 0 || (resultSpec && resultSpec.sorts && resultSpec.sorts.length > 0);

    return sortedByFirstAttribute || !isSorted;
}

export const getSortsFromModel = (
    sortModel: ISortModelItem[], // AgGrid has any, but we can do better
    execution: Execution.IExecutionResponses,
) => {
    return sortModel.map((sortModelItem: ISortModelItem) => {
        const { colId, sort } = sortModelItem;
        const sortHeader = getSortItemByColId(execution, colId, sort);
        invariant(sortHeader, `unable to find sort item by field ${colId}`);
        return sortHeader;
    });
};

export const assignSorting = (colDef: ColDef, sortingMap: { [key: string]: string }): void => {
    const direction = sortingMap[colDef.field];
    if (direction) {
        colDef.sort = direction;
    }
};
