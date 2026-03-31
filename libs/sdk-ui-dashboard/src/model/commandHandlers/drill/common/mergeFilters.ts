// (C) 2026 GoodData Corporation

import {
    type FilterContextItem,
    type IAttributeElements,
    type IAttributeFilter,
    type IAttributeFilterWithSelection,
    type IDashboardAttributeFilter,
    type IDateFilter,
    areObjRefsEqual,
    filterAttributeElements,
    filterObjRef,
    isAttributeFilterWithSelection,
    isDashboardAttributeFilter,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";

type SourceFilter = IAttributeFilter | IDateFilter;

/**
 * Merges dashboard filters with source filters by intersecting attribute element values
 * for filters that target the same attribute (matched by display form ref).
 *
 * - Matching attribute filters: element values are intersected (AND semantics).
 * - Unmatched filters from either side: passed through as-is.
 * - Date filters: passed through as-is (no intersection).
 */
export function mergeDashboardAndSourceFilters(
    dashboardFilters: FilterContextItem[],
    sourceFilters: SourceFilter[],
): Array<FilterContextItem | SourceFilter> {
    if (!sourceFilters.length) {
        return dashboardFilters;
    }

    const usedSourceIndices = new Set<number>();

    const mergedDashboardFilters = dashboardFilters.map((dashFilter) => {
        if (!isDashboardAttributeFilter(dashFilter)) {
            return dashFilter;
        }

        const dashRef = dashFilter.attributeFilter.displayForm;

        const sourceIndex = sourceFilters.findIndex((sf, i) => {
            if (usedSourceIndices.has(i) || !isAttributeFilterWithSelection(sf)) {
                return false;
            }
            const sourceRef = filterObjRef(sf);
            return sourceRef ? areObjRefsEqual(dashRef, sourceRef) : false;
        });

        if (sourceIndex === -1) {
            return dashFilter;
        }

        usedSourceIndices.add(sourceIndex);
        const sourceFilter = sourceFilters[sourceIndex] as IAttributeFilterWithSelection;

        return intersectAttributeFilters(dashFilter, sourceFilter);
    });

    const remainingSourceFilters = sourceFilters.filter((_, i) => !usedSourceIndices.has(i));

    return [...mergedDashboardFilters, ...remainingSourceFilters];
}

function intersectAttributeFilters(
    dashFilter: IDashboardAttributeFilter,
    sourceFilter: IAttributeFilterWithSelection,
): IDashboardAttributeFilter {
    const dashElements = dashFilter.attributeFilter.attributeElements;
    const dashNegative = dashFilter.attributeFilter.negativeSelection;
    const sourceElements = filterAttributeElements(sourceFilter);
    const sourceNegative = isNegativeAttributeFilter(sourceFilter);

    const [intersectedValues, negativeSelection] = intersectElements(
        getValues(dashElements),
        dashNegative,
        getValues(sourceElements),
        sourceNegative,
    );

    return {
        attributeFilter: {
            ...dashFilter.attributeFilter,
            attributeElements: setValues(dashElements, intersectedValues),
            negativeSelection,
        },
    };
}

/**
 * Computes the logical AND (intersection) of two sets of attribute element selections.
 *
 * | A             | B             | Result                                    |
 * |---------------|---------------|-------------------------------------------|
 * | Positive (A)  | Positive (B)  | Positive (A ∩ B)                          |
 * | Negative (A)  | Negative (B)  | Negative (A ∪ B)                          |
 * | Positive (A)  | Negative (B)  | Positive (A \ B)                          |
 * | Negative (A)  | Positive (B)  | Positive (B \ A)                          |
 */
function intersectElements(
    aValues: Array<string | null>,
    aNegative: boolean,
    bValues: Array<string | null>,
    bNegative: boolean,
): [Array<string | null>, boolean] {
    if (!aNegative && !bNegative) {
        const bSet = new Set(bValues);
        return [aValues.filter((v) => bSet.has(v)), false];
    }

    if (aNegative && bNegative) {
        return [[...new Set([...aValues, ...bValues])], true];
    }

    if (!aNegative && bNegative) {
        const bSet = new Set(bValues);
        return [aValues.filter((v) => !bSet.has(v)), false];
    }

    const aSet = new Set(aValues);
    return [bValues.filter((v) => !aSet.has(v)), false];
}

function getValues(elements: IAttributeElements): Array<string | null> {
    return "uris" in elements ? elements.uris : elements.values;
}

function setValues(template: IAttributeElements, values: Array<string | null>): IAttributeElements {
    return "uris" in template ? { uris: values } : { values };
}
