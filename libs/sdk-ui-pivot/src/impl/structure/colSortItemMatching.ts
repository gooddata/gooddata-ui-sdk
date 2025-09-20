// (C) 2021-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    IAttributeLocatorItem,
    IMeasureLocatorItem,
    ISortItem,
    isAttributeLocator,
    isAttributeSort,
    isMeasureLocator,
    isMeasureSort,
    sortMeasureLocators,
} from "@gooddata/sdk-model";

import { SeriesCol, SliceCol } from "./tableDescriptorTypes.js";

function attributeLocatorMatch(col: SeriesCol, locator: IAttributeLocatorItem): boolean {
    const { attributeDescriptors, attributeHeaders } = col.seriesDescriptor;
    const { attributeIdentifier, element } = locator.attributeLocatorItem;

    if (!attributeDescriptors || !attributeHeaders) {
        return false;
    }

    const attributeIdx = attributeDescriptors.findIndex(
        (d) => d.attributeHeader.localIdentifier === attributeIdentifier,
    );

    if (attributeIdx === -1) {
        return false;
    }

    // if this happens then either data access infrastructure or the col descriptor method is hosed. there must
    // always be same number of descriptors and headers.
    invariant(attributeHeaders[attributeIdx]);

    return attributeHeaders[attributeIdx]?.attributeHeaderItem?.uri === element;
}

function measureLocatorMatch(col: SeriesCol, locator: IMeasureLocatorItem): boolean {
    const { measureDescriptor } = col.seriesDescriptor;
    const { measureIdentifier } = locator.measureLocatorItem;

    return measureDescriptor.measureHeaderItem.localIdentifier === measureIdentifier;
}

export function measureSortMatcher(col: SeriesCol, sortItem: ISortItem): boolean {
    return (
        isMeasureSort(sortItem) &&
        sortMeasureLocators(sortItem).every((locator) => {
            if (isAttributeLocator(locator)) {
                return attributeLocatorMatch(col, locator);
            } else if (isMeasureLocator(locator)) {
                return measureLocatorMatch(col, locator);
            }

            return undefined;
        })
    );
}

export function attributeSortMatcher(col: SliceCol, sortItem: ISortItem): boolean {
    return (
        isAttributeSort(sortItem) &&
        col.attributeDescriptor.attributeHeader.localIdentifier ===
            sortItem.attributeSortItem.attributeIdentifier
    );
}
