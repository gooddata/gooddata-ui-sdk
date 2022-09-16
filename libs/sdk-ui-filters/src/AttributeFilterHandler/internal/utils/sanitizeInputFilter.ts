// (C) 2022 GoodData Corporation
import difference from "lodash/difference";
import {
    filterAttributeElements,
    filterObjRef,
    IAttributeElements,
    IAttributeFilter,
    isAttributeElementsByRef,
    isNegativeAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

/**
 * Removes the elements specified in hidden elements from the input filter: they are handled down the line.
 *
 * @param attributeFilter - filter to sanitize
 * @param hiddenElements - hidden elements to use
 * @internal
 */
export function sanitizeInputFilter<T extends IAttributeFilter>(
    attributeFilter: T,
    hiddenElements: string[] | undefined,
): T {
    if (!hiddenElements?.length) {
        return attributeFilter;
    }

    const selection = filterAttributeElements(attributeFilter);
    const rawSelection = isAttributeElementsByRef(selection) ? selection.uris : selection.values;
    const sanitizedRawSelection = difference(rawSelection, hiddenElements);
    const sanitizedSelection: IAttributeElements = isAttributeElementsByRef(selection)
        ? { uris: sanitizedRawSelection }
        : { values: sanitizedRawSelection };

    return isNegativeAttributeFilter(attributeFilter)
        ? (newNegativeAttributeFilter(filterObjRef(attributeFilter), sanitizedSelection) as T)
        : (newPositiveAttributeFilter(filterObjRef(attributeFilter), sanitizedSelection) as T);
}
