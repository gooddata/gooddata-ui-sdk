// (C) 2021-2022 GoodData Corporation
import { AnyCol, isSeriesCol, isSliceCol } from "./tableDescriptorTypes.js";
import { invariant, InvariantError } from "ts-invariant";
import {
    IAttributeLocatorItem,
    IAttributeSortItem,
    ILocatorItem,
    IMeasureLocatorItem,
    isAttributeAreaSort,
    isAttributeSort,
    ISortItem,
    newAttributeAreaSort,
    newAttributeSort,
    SortDirection,
    IMeasureDescriptor,
    IAttributeDescriptor,
    IResultAttributeHeader,
} from "@gooddata/sdk-model";
import zip from "lodash/zip.js";

function createAttributeLocator(
    attribute: IAttributeDescriptor | undefined,
    header: IResultAttributeHeader | undefined,
): IAttributeLocatorItem {
    // if this bombs it means something is wrong with the col descriptors or in very bad case in the DVF data access logic.
    // by contract, all data series have same number of descriptors & headers. therefore the zipping logic should never
    // run into situation where the arrays are of different size.
    invariant(attribute && header);

    return {
        attributeLocatorItem: {
            attributeIdentifier: attribute.attributeHeader.localIdentifier,
            element: header.attributeHeaderItem.uri,
        },
    };
}

function createMeasureLocator(measure: IMeasureDescriptor): IMeasureLocatorItem {
    return {
        measureLocatorItem: {
            measureIdentifier: measure.measureHeaderItem.localIdentifier,
        },
    };
}

/**
 * Creates a SortItem for the provided column, sorting in particular direction. Depending on the column type,
 * this factory will create either an attribute sort item or measure sort item with appropriate locators.
 *
 * Note the originalSorts. These are optional, if provided they are used when creating an attribute sort to
 * determine whether to create 'normal' or area sort for that column.
 *
 * @param col - col to get sort item for
 * @param direction - sort direction
 * @param originalSorts - original sorts, optional, to determine if area sort indicator should be transferred.
 */
export function createSortItemForCol(
    col: AnyCol,
    direction: SortDirection,
    originalSorts: ISortItem[] = [],
): ISortItem {
    if (isSliceCol(col)) {
        const attributeLocalId = col.attributeDescriptor.attributeHeader.localIdentifier;

        const matchingOriginalSortItem = originalSorts.find(
            (s) => isAttributeSort(s) && s.attributeSortItem.attributeIdentifier === attributeLocalId,
        ) as IAttributeSortItem;

        return isAttributeAreaSort(matchingOriginalSortItem)
            ? newAttributeAreaSort(attributeLocalId, direction)
            : newAttributeSort(attributeLocalId, direction);
    } else if (isSeriesCol(col)) {
        const locators: ILocatorItem[] = [];
        if (col.seriesDescriptor.attributeDescriptors && col.seriesDescriptor.attributeHeaders) {
            const descriptorAndHeaders = zip(
                col.seriesDescriptor.attributeDescriptors,
                col.seriesDescriptor.attributeHeaders,
            );

            descriptorAndHeaders.forEach(([descriptor, header]) =>
                locators.push(createAttributeLocator(descriptor, header)),
            );
        }

        locators.push(createMeasureLocator(col.seriesDescriptor.measureDescriptor));

        return {
            measureSortItem: {
                direction,
                locators,
            },
        };
    }

    throw new InvariantError(`cannot get sort item for the column type ${col.type}`);
}
