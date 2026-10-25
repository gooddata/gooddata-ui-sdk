// (C) 2023-2026 GoodData Corporation

import {
    type CatalogItem,
    type ObjRef,
    areObjRefsEqual,
    isCatalogAttribute,
    isCatalogComputedAttribute,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";

export const areCatalogItemsEquals = (itemA: CatalogItem, itemB: CatalogItem) => {
    if (isCatalogAttribute(itemA) && isCatalogAttribute(itemB)) {
        return areObjRefsEqual(itemA.attribute.ref, itemB.attribute.ref);
    } else if (isCatalogMeasure(itemA) && isCatalogMeasure(itemB)) {
        return areObjRefsEqual(itemA.measure.ref, itemB.measure.ref);
    } else if (isCatalogFact(itemA) && isCatalogFact(itemB)) {
        return areObjRefsEqual(itemA.fact.ref, itemB.fact.ref);
    } else if (isCatalogComputedAttribute(itemA) && isCatalogComputedAttribute(itemB)) {
        return areObjRefsEqual(itemA.computedAttribute.ref, itemB.computedAttribute.ref);
    } else if (isCatalogDateDataset(itemA) && isCatalogDateDataset(itemB)) {
        return true;
    }
    return false;
};

export const isCatalogItemRef = (item: CatalogItem, ref: ObjRef) => {
    if (isCatalogAttribute(item)) {
        return areObjRefsEqual(item.attribute.ref, ref);
    } else if (isCatalogMeasure(item)) {
        return areObjRefsEqual(item.measure.ref, ref);
    } else if (isCatalogFact(item)) {
        return areObjRefsEqual(item.fact.ref, ref);
    } else if (isCatalogComputedAttribute(item)) {
        return (
            areObjRefsEqual(item.computedAttribute.ref, ref) ||
            areObjRefsEqual(item.defaultDisplayForm.ref, ref)
        );
    } else if (isCatalogDateDataset(item)) {
        return areObjRefsEqual(item.dataSet.ref, ref);
    }
    return false;
};
