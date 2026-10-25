// (C) 2020-2026 GoodData Corporation

import { differenceWith, isEqual } from "lodash-es";

import {
    type CatalogItem,
    areObjRefsEqual,
    isCatalogAttribute,
    isCatalogComputedAttribute,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";

const areItemRefsEqual = (firstItem: CatalogItem, secondItem: CatalogItem): boolean => {
    if (isCatalogAttribute(firstItem) && isCatalogAttribute(secondItem)) {
        return areObjRefsEqual(firstItem.attribute.ref, secondItem.attribute.ref);
    }

    if (isCatalogDateDataset(firstItem) && isCatalogDateDataset(secondItem)) {
        return areObjRefsEqual(firstItem.dataSet.ref, secondItem.dataSet.ref);
    }

    if (isCatalogFact(firstItem) && isCatalogFact(secondItem)) {
        return areObjRefsEqual(firstItem.fact.ref, secondItem.fact.ref);
    }

    if (isCatalogMeasure(firstItem) && isCatalogMeasure(secondItem)) {
        return areObjRefsEqual(firstItem.measure.ref, secondItem.measure.ref);
    }

    if (isCatalogComputedAttribute(firstItem) && isCatalogComputedAttribute(secondItem)) {
        return areObjRefsEqual(firstItem.computedAttribute.ref, secondItem.computedAttribute.ref);
    }

    return false;
};

export const getChangedItemsCount = (
    originalItems: ReadonlyArray<CatalogItem>,
    newItems: ReadonlyArray<CatalogItem>,
): number => {
    const removedItems = differenceWith(originalItems, newItems, areItemRefsEqual);
    const addedItems = differenceWith(newItems, originalItems, areItemRefsEqual);
    const updatedItems = newItems.filter((newItem) =>
        originalItems.find(
            (originalItem) => areItemRefsEqual(originalItem, newItem) && !isEqual(originalItem, newItem),
        ),
    );

    return removedItems.length + addedItems.length + updatedItems.length;
};
