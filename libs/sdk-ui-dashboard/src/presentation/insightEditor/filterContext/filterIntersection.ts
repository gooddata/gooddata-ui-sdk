// (C) 2007-2026 GoodData Corporation

import { uniq } from "lodash-es";

import {
    type INegativeAttributeFilter as IEmbedNegativeAttributeFilter,
    type IPositiveAttributeFilter as IEmbedPositiveAttributeFilter,
    isNegativeAttributeFilter as isEmbedNegativeAttributeFilter,
    isPositiveAttributeFilter as isEmbedPositiveAttributeFilter,
} from "@gooddata/sdk-embedding";
import {
    type IAttributeElements,
    type IAttributeFilterWithSelection,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    filterAttributeElements,
    filterIsEmpty,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isNegativeAttributeFilter,
    isObjRef,
    isPositiveAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

// The embedding API types the element lists as strings. The null element (an empty value) passes
// through as it is.
function elementIds(elements: IAttributeElements): string[] {
    return (isAttributeElementsByRef(elements) ? elements.uris : elements.values) as string[];
}

export function intersectPositiveWithNegativeAttrFilters(
    positiveAttrFilter: IPositiveAttributeFilter,
    negativeAttrFilter: IEmbedNegativeAttributeFilter,
): IEmbedPositiveAttributeFilter {
    const normalizedPositiveAttrFilter = normalizeEmptyFilterElements(
        positiveAttrFilter,
    ) as IPositiveAttributeFilter;

    const attributeElements = normalizedPositiveAttrFilter.positiveAttributeFilter.in;

    //NOTE: Currently in dashboard filters we are not support local identifiers, so we can safely assume that
    // that displayForm is ObjRef
    if (!isObjRef(normalizedPositiveAttrFilter.positiveAttributeFilter.displayForm)) {
        throw new Error("Expected positive attribute filter display form to be ObjRef");
    }

    if (!isAttributeElementsByRef(attributeElements)) {
        return {
            positiveAttributeFilter: {
                displayForm: normalizedPositiveAttrFilter.positiveAttributeFilter.displayForm,
                in: elementIds(attributeElements).filter(
                    (identifier: string) =>
                        !negativeAttrFilter.negativeAttributeFilter.notIn.includes(identifier),
                ),
            },
        };
    }

    return {
        positiveAttributeFilter: {
            displayForm: normalizedPositiveAttrFilter.positiveAttributeFilter.displayForm,
            in: elementIds(attributeElements).filter(
                (uri: string) => !negativeAttrFilter.negativeAttributeFilter.notIn.includes(uri),
            ),
        },
    };
}

export function intersectPositiveWithNegativeAttrFilters2(
    positiveAttrFilter: IEmbedPositiveAttributeFilter,
    negativeAttrFilter: INegativeAttributeFilter,
): IEmbedPositiveAttributeFilter {
    const normalizedNegativeAttrFilter = normalizeEmptyFilterElements(
        negativeAttrFilter,
    ) as INegativeAttributeFilter;

    const attributeElements = normalizedNegativeAttrFilter.negativeAttributeFilter.notIn;

    if (!isAttributeElementsByRef(attributeElements)) {
        return {
            positiveAttributeFilter: {
                displayForm: positiveAttrFilter.positiveAttributeFilter.displayForm,
                in: positiveAttrFilter.positiveAttributeFilter.in.filter(
                    (identifier: string) => !elementIds(attributeElements).includes(identifier),
                ),
            },
        };
    }

    return {
        positiveAttributeFilter: {
            displayForm: positiveAttrFilter.positiveAttributeFilter.displayForm,
            in: positiveAttrFilter.positiveAttributeFilter.in.filter(
                (uri: string) => !elementIds(attributeElements).includes(uri),
            ),
        },
    };
}
export function intersectFilters(
    insightAttrFilter: IAttributeFilterWithSelection,
    attrFilterContext: IEmbedPositiveAttributeFilter | IEmbedNegativeAttributeFilter,
): IEmbedPositiveAttributeFilter | IEmbedNegativeAttributeFilter {
    const normalizedInsightAttrFilter = normalizeEmptyFilterElements(insightAttrFilter);

    const attributeElements = filterAttributeElements(normalizedInsightAttrFilter);

    if (!isAttributeElementsByRef(attributeElements)) {
        if (isPositiveAttributeFilter(normalizedInsightAttrFilter)) {
            if (isEmbedPositiveAttributeFilter(attrFilterContext)) {
                return {
                    positiveAttributeFilter: {
                        displayForm: attrFilterContext.positiveAttributeFilter.displayForm,
                        in: attrFilterContext.positiveAttributeFilter.in.filter((identifier: string) =>
                            elementIds(attributeElements).includes(identifier),
                        ),
                    },
                };
            }
            return intersectPositiveWithNegativeAttrFilters(normalizedInsightAttrFilter, attrFilterContext);
        } else {
            if (isEmbedNegativeAttributeFilter(attrFilterContext)) {
                return {
                    negativeAttributeFilter: {
                        displayForm: attrFilterContext.negativeAttributeFilter.displayForm,
                        notIn: uniq(
                            elementIds(attributeElements).concat(
                                attrFilterContext.negativeAttributeFilter.notIn,
                            ),
                        ),
                    },
                };
            }
            return intersectPositiveWithNegativeAttrFilters2(attrFilterContext, normalizedInsightAttrFilter);
        }
    }

    if (isPositiveAttributeFilter(normalizedInsightAttrFilter)) {
        if (isEmbedPositiveAttributeFilter(attrFilterContext)) {
            return {
                positiveAttributeFilter: {
                    displayForm: attrFilterContext.positiveAttributeFilter.displayForm,
                    in: attrFilterContext.positiveAttributeFilter.in.filter((uri: string) =>
                        elementIds(attributeElements).includes(uri),
                    ),
                },
            };
        }
        return intersectPositiveWithNegativeAttrFilters(normalizedInsightAttrFilter, attrFilterContext);
    } else {
        if (isEmbedNegativeAttributeFilter(attrFilterContext)) {
            return {
                negativeAttributeFilter: {
                    displayForm: attrFilterContext.negativeAttributeFilter.displayForm,
                    notIn: uniq(
                        elementIds(attributeElements).concat(attrFilterContext.negativeAttributeFilter.notIn),
                    ),
                },
            };
        }
        return intersectPositiveWithNegativeAttrFilters2(
            attrFilterContext,
            normalizedInsightAttrFilter as INegativeAttributeFilter,
        );
    }
}

export function areFiltersWithSameElements(
    insightAttrFilter: IAttributeFilterWithSelection,
    attrFilterContext: IEmbedPositiveAttributeFilter | IEmbedNegativeAttributeFilter,
): boolean {
    const normalizedInsightAttrFilter = normalizeEmptyFilterElements(insightAttrFilter);

    const attributeElements = filterAttributeElements(normalizedInsightAttrFilter);

    if (!isAttributeElementsByRef(attributeElements)) {
        if (
            isPositiveAttributeFilter(normalizedInsightAttrFilter) &&
            isEmbedPositiveAttributeFilter(attrFilterContext)
        ) {
            return (
                elementIds(attributeElements).length ===
                    attrFilterContext.positiveAttributeFilter.in.length &&
                elementIds(attributeElements).every((identifier: string) =>
                    attrFilterContext.positiveAttributeFilter.in.includes(identifier),
                )
            );
        } else if (
            isNegativeAttributeFilter(normalizedInsightAttrFilter) &&
            isEmbedNegativeAttributeFilter(attrFilterContext)
        ) {
            return (
                elementIds(attributeElements).length ===
                    attrFilterContext.negativeAttributeFilter.notIn.length &&
                elementIds(attributeElements).every((identifier: string) =>
                    attrFilterContext.negativeAttributeFilter.notIn.includes(identifier),
                )
            );
        }
        return false;
    }

    if (
        isPositiveAttributeFilter(normalizedInsightAttrFilter) &&
        isEmbedPositiveAttributeFilter(attrFilterContext)
    ) {
        return (
            elementIds(attributeElements).length === attrFilterContext.positiveAttributeFilter.in.length &&
            elementIds(attributeElements).every((uri: string) =>
                attrFilterContext.positiveAttributeFilter.in.includes(uri),
            )
        );
    } else if (
        isNegativeAttributeFilter(normalizedInsightAttrFilter) &&
        isEmbedNegativeAttributeFilter(attrFilterContext)
    ) {
        return (
            elementIds(attributeElements).length === attrFilterContext.negativeAttributeFilter.notIn.length &&
            elementIds(attributeElements).every((uri: string) =>
                attrFilterContext.negativeAttributeFilter.notIn.includes(uri),
            )
        );
    }
    return false;
}

/**
 * Empty attribute filters by value and by uri are same, so we want to sometimes normalize them to uris.
 * If filter is not empty it can't be normalized, so same filter is returned
 * @param filter -
 * @returns empty filter with uri elements or original filter
 */
function normalizeEmptyFilterElements(filter: IAttributeFilterWithSelection): IAttributeFilterWithSelection {
    const attributeElements = filterAttributeElements(filter);

    if (filterIsEmpty(filter) && isAttributeElementsByValue(attributeElements)) {
        if (isPositiveAttributeFilter(filter) && isObjRef(filter.positiveAttributeFilter.displayForm)) {
            return newPositiveAttributeFilter(filter.positiveAttributeFilter.displayForm, { uris: [] });
        }
        if (isNegativeAttributeFilter(filter) && isObjRef(filter.negativeAttributeFilter.displayForm)) {
            return newNegativeAttributeFilter(filter.negativeAttributeFilter.displayForm, { uris: [] });
        }
        throw new Error("Invariant: expected positive or negative filter");
    }

    return filter;
}
