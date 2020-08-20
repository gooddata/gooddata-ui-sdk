// (C) 2007-2020 GoodData Corporation
import {
    getAttributeLocators,
    getIdsFromUri,
    getLastFieldId,
    getLastFieldType,
    getParsedFields,
} from "./agGridUtils";
import { FIELD_TYPE_ATTRIBUTE, FIELD_TYPE_MEASURE } from "./agGridConst";
import { assortDimensionDescriptors } from "./agGridHeaders";
import { ISortModelItem } from "./agGridTypes";
import {
    IAttributeSortItem,
    IMeasureSortItem,
    isAttributeAreaSort,
    isAttributeSort,
    ISortItem,
    newAttributeAreaSort,
    newAttributeSort,
    SortDirection,
} from "@gooddata/sdk-model";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import invariant, { InvariantError } from "ts-invariant";

/*
 * All code related to sorting the ag-grid backed Pivot Table is concentrated here
 */

export const getSortItemByColId = (
    result: IExecutionResult,
    colId: string,
    direction: SortDirection,
    originalSorts: ISortItem[] = [],
): IMeasureSortItem | IAttributeSortItem => {
    const { dimensions } = result;

    const fields = getParsedFields(colId);
    const lastFieldType = getLastFieldType(fields);
    const lastFieldId = getLastFieldId(fields);

    // search columns first when sorting in columns to use the proper header
    // in case the same attribute is in both rows and columns
    const searchDimensionIndex = lastFieldType === FIELD_TYPE_MEASURE ? 1 : 0;
    const { attributeDescriptors, measureDescriptors } = assortDimensionDescriptors([
        dimensions[searchDimensionIndex],
    ]);

    if (lastFieldType === FIELD_TYPE_ATTRIBUTE) {
        for (const header of attributeDescriptors) {
            if (getIdsFromUri(header.attributeHeader.uri)[0] === lastFieldId) {
                const attributeLocalId = header.attributeHeader.localIdentifier;

                // try to find the original sort item in case it had an aggregation set so we can keep it in (RAIL-1992)
                // we intentionally ignore the direction to make sure the UX is predictable
                const matchingOriginalSortItem = originalSorts.find(
                    (s) => isAttributeSort(s) && s.attributeSortItem.attributeIdentifier === attributeLocalId,
                ) as IAttributeSortItem;

                return isAttributeAreaSort(matchingOriginalSortItem)
                    ? newAttributeAreaSort(attributeLocalId, direction)
                    : newAttributeSort(attributeLocalId, direction);
            }
        }
        throw new InvariantError(`could not find attribute header matching ${colId}`);
    } else if (lastFieldType === FIELD_TYPE_MEASURE) {
        const headerItem = measureDescriptors[parseInt(lastFieldId, 10)];
        const attributeLocators = getAttributeLocators(fields, attributeDescriptors);

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
    throw new InvariantError(`could not find header matching ${colId}`);
};

export function getSortsFromModel(sortModel: ISortModelItem[], result: IExecutionResult): ISortItem[] {
    const originalSorts = result.definition.sortBy;

    return sortModel.map((sortModelItem: ISortModelItem) => {
        const { colId, sort } = sortModelItem;
        const sortHeader = getSortItemByColId(result, colId, sort, originalSorts);
        invariant(sortHeader, `unable to find sort item by field ${colId}`);
        return sortHeader;
    });
}
