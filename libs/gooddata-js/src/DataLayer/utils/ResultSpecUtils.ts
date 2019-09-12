// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { normalizeAfm } from "./AfmUtils";

/**
 * Attaches sorts into resultSpec
 *
 * @method applySorting
 * @param {AFM.IResultSpec} resultSpec
 * @param {AFM.SortItem[]} sortItems
 * @returns {AFM.IResultSpec}
 */
export function applySorting(
    resultSpec: AFM.IResultSpec = {},
    sortItems: AFM.SortItem[] = [],
): AFM.IResultSpec {
    if (sortItems.length === 0) {
        return resultSpec;
    }
    return {
        ...resultSpec,
        sorts: sortItems,
    };
}

function sortItemIsAttribute(sortItem: AFM.SortItem): sortItem is AFM.IAttributeSortItem {
    return !!(sortItem as AFM.IAttributeSortItem).attributeSortItem;
}

function sortItemIsMeasure(sortItem: AFM.SortItem): sortItem is AFM.IMeasureSortItem {
    return !sortItemIsAttribute(sortItem);
}

function locatorIsMeasure(locator: AFM.LocatorItem): locator is AFM.IMeasureLocatorItem {
    return !!(locator as AFM.IMeasureLocatorItem).measureLocatorItem;
}

function getSortItemIdentifier(sortItem: AFM.SortItem): string | null {
    if (sortItemIsAttribute(sortItem)) {
        return sortItem.attributeSortItem.attributeIdentifier;
    }
    if (sortItemIsMeasure(sortItem)) {
        const locator: AFM.LocatorItem = sortItem.measureSortItem.locators[0];
        if (locatorIsMeasure(locator)) {
            return locator.measureLocatorItem.measureIdentifier;
        }
    }

    return null;
}

/**
 * Returns true if sortItem fits to afm
 *
 * @method isSortValid
 * @param {AFM.IAfm} afm
 * @param {AFM.SortItem} sortItem
 * @returns {boolean}
 */
export function isSortValid(afm: AFM.IAfm, sortItem?: AFM.SortItem): boolean {
    if (!sortItem) {
        return true;
    }
    const sortIdentifier = getSortItemIdentifier(sortItem);
    const normalizedAfm = normalizeAfm(afm);
    return (
        normalizedAfm.measures.some(m => m.localIdentifier === sortIdentifier) ||
        normalizedAfm.attributes.some(a => a.localIdentifier === sortIdentifier)
    );
}
