// (C) 2020-2026 GoodData Corporation

import { compact } from "lodash-es";

import {
    type AttributeFilterItem,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    isPositiveAttributeFilter,
} from "@gooddata/sdk-embedding";
import {
    type IAttributeFilter,
    type IAttributeFilterWithSelection,
    type ICatalogAttribute,
    type IFilter,
    type IInsight,
    type ObjRef,
    areObjRefsEqual,
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    insightFilters,
    isArbitraryAttributeFilter,
    isAttributeElementsByValue,
    isAttributeFilter,
    isMatchAttributeFilter,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";

import { areFiltersWithSameElements, intersectFilters } from "./filterIntersection.js";
import { toObjIdentifierQualifier } from "./objQualifiers.js";

function getValidAppliedAttributeFilters(
    appliedFilters: IFilter[],
    availableAttributes: ICatalogAttribute[],
): IAttributeFilter[] {
    return (
        appliedFilters
            .filter(isAttributeFilter)
            // remove filters not on attributes that are available for the given insight
            // those are considered invalid
            .filter((attrFilter) => {
                const filterDisplayForm = filterObjRef(attrFilter);
                return availableAttributes.some((available) => {
                    return available.displayForms.some((displayForm) =>
                        areObjRefsEqual(displayForm.ref, filterDisplayForm),
                    );
                });
            })
    );
}

export function getAttributeFilterItems(
    appliedFilters: IFilter[],
    insight: IInsight,
    availableAttributes: ICatalogAttribute[],
    attributeFilterConfigsDisplayAsLabelMap: Map<string, ObjRef> | undefined,
    supportsElementUris: boolean,
): AttributeFilterItem[] {
    return getAttributeFilterItemsFromAppliedFilters(
        getValidAppliedAttributeFilters(appliedFilters, availableAttributes),
        insightFilters(insight).filter(isAttributeFilter),
        availableAttributes,
        attributeFilterConfigsDisplayAsLabelMap,
        supportsElementUris,
    );
}

function getAttributeFilterItemsFromAppliedFilters(
    appliedFilters: IAttributeFilter[],
    insightAttrFilters: IAttributeFilter[],
    availableAttributes: ICatalogAttribute[],
    attributeFilterConfigsDisplayAsLabelMap: Map<string, ObjRef> | undefined,
    supportsElementUris: boolean,
): AttributeFilterItem[] {
    const processedFilters = appliedFilters
        // validate and intersect the dashboard filters with the insight filters
        .map((attrFilter): AttributeFilterItem | undefined => {
            const filterDisplayForm = filterObjRef(attrFilter);
            const isInverted = isNegativeAttributeFilter(attrFilter);
            const selectedElements = filterAttributeElements(attrFilter);
            const localIdentifier = filterLocalIdentifier(attrFilter);

            if (isArbitraryAttributeFilter(attrFilter)) {
                const { label, values, negativeSelection } = attrFilter.arbitraryAttributeFilter;
                return {
                    arbitraryAttributeFilter: {
                        displayForm: toObjIdentifierQualifier(label),
                        values: values as string[],
                        ...(negativeSelection === undefined ? {} : { negativeSelection }),
                    },
                };
            }
            if (isMatchAttributeFilter(attrFilter)) {
                const { label, operator, literal, caseSensitive, negativeSelection } =
                    attrFilter.matchAttributeFilter;
                return {
                    matchAttributeFilter: {
                        displayForm: toObjIdentifierQualifier(label),
                        operator,
                        literal,
                        ...(caseSensitive === undefined ? {} : { caseSensitive }),
                        ...(negativeSelection === undefined ? {} : { negativeSelection }),
                    },
                };
            }

            if (isAttributeElementsByValue(selectedElements)) {
                // effectively skipping insight-based filters by this
                return undefined;
            }

            const filterDisplayAsLabel = localIdentifier
                ? attributeFilterConfigsDisplayAsLabelMap?.get(localIdentifier)
                : undefined;

            // The embedding API types the element lists as strings. The null element passes as it is.
            const elementUris = [...((selectedElements?.uris ?? []) as string[])];
            const attrFilterContext: IPositiveAttributeFilter | INegativeAttributeFilter = isInverted
                ? {
                      negativeAttributeFilter: {
                          displayForm: filterDisplayForm,
                          notIn: elementUris,
                      },
                      ...(filterDisplayAsLabel ? { displayAsLabel: filterDisplayAsLabel } : {}),
                  }
                : {
                      positiveAttributeFilter: {
                          displayForm: filterDisplayForm,
                          in: elementUris,
                      },
                      ...(filterDisplayAsLabel ? { displayAsLabel: filterDisplayAsLabel } : {}),
                  };

            // Check if the insight contains a filter on the same attribute
            const insightAttrFilter = getInsightAttrFilter(
                insightAttrFilters,
                attrFilter,
                availableAttributes,
            );

            if (
                insightAttrFilter &&
                !supportsElementUris &&
                !areObjRefsEqual(filterDisplayForm, filterObjRef(insightAttrFilter))
            ) {
                // when the display form is different and the backend does not support element uris, skip it and don't transfer the filter
                // (when uris not supported, we cannot match the elements for filters easily)
                return undefined;
            }

            // If it does, try to merge the two filters so that the resulting elements are the intersection of the two
            // The intersection might not be possible and return undefined in that case
            // Only element-based insight filters can be intersected with the dashboard filter
            return insightAttrFilter &&
                !isArbitraryAttributeFilter(insightAttrFilter) &&
                !isMatchAttributeFilter(insightAttrFilter)
                ? getIntersectedAttrFilterContext(insightAttrFilter, attrFilterContext)
                : attrFilterContext;
        });

    return compact(processedFilters);
}

function getInsightAttrFilter(
    insightAttrFilters: IAttributeFilter[],
    attrFilter: IAttributeFilter,
    availableAttributes: ICatalogAttribute[],
): IAttributeFilter | undefined {
    const targetDisplayForm = filterObjRef(attrFilter);
    return insightAttrFilters.find((filterItem) => {
        const filterItemDisplayForm = filterObjRef(filterItem);
        const filterItemAttribute = availableAttributes?.find((availableAttribute) => {
            return availableAttribute.displayForms.some((displayForm) =>
                areObjRefsEqual(displayForm.ref, filterItemDisplayForm),
            );
        });

        return filterItemAttribute?.displayForms.some((displayForm) =>
            areObjRefsEqual(displayForm.ref, targetDisplayForm),
        );
    });
}

function getIntersectedAttrFilterContext(
    insightAttrFilter: IAttributeFilterWithSelection,
    attrFilterContext: IPositiveAttributeFilter | INegativeAttributeFilter,
): AttributeFilterItem | undefined {
    const intersectedAttrFilter = intersectFilters(insightAttrFilter, attrFilterContext);
    const isIntersectedNoop = isPositiveAttributeFilter(intersectedAttrFilter)
        ? intersectedAttrFilter.positiveAttributeFilter.in.length === 0
        : false; // strictly speaking, this needs to check whether all the items are selected, however such filter is extremely improbable and not worth the hassle
    if (isIntersectedNoop || areFiltersWithSameElements(insightAttrFilter, intersectedAttrFilter)) {
        return undefined;
    }
    return intersectedAttrFilter;
}
