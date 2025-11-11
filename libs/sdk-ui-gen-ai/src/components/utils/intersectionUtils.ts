// (C) 2025 GoodData Corporation

import { IDashboardAttributeFilter, areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";
import {
    DrillEventIntersectionElementHeader,
    IDrillEventIntersectionElement,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";

export function convertIntersectionToAttributeFilters(
    intersection: IDrillEventIntersectionElement[],
): IDashboardAttributeFilter[] {
    return intersection
        .map((i) => i.header)
        .filter((i: DrillEventIntersectionElementHeader) => filterIntersection(i))
        .filter(isDrillIntersectionAttributeItem)
        .reduce((result, h: IDrillIntersectionAttributeItem, i) => {
            const ref = h.attributeHeader.ref;
            const elementValue = h.attributeHeaderItem.uri;
            const titleObj = { title: h.attributeHeader.formOf?.name };
            result.push({
                attributeFilter: {
                    attributeElements: { uris: [elementValue] },
                    displayForm: ref,
                    negativeSelection: false,
                    localIdentifier: `${objRefToString(ref)}_${i}`,
                    ...titleObj,
                },
            });
            return result;
        }, [] as IDashboardAttributeFilter[]);
}

export function mergeFilters(
    intersectionFilters: IDashboardAttributeFilter[],
    attributeFilters: IDashboardAttributeFilter[],
): IDashboardAttributeFilter[] {
    const unusedFilters = intersectionFilters.filter((filter) => {
        return !attributeFilters.find((f) =>
            areObjRefsEqual(f.attributeFilter.displayForm, filter.attributeFilter.displayForm),
        );
    });

    return [
        ...attributeFilters.map((filter) => {
            const intersectionFilter = intersectionFilters.find((f) =>
                areObjRefsEqual(f.attributeFilter.displayForm, filter.attributeFilter.displayForm),
            );
            if (intersectionFilter) {
                return intersectionFilter;
            }
            return filter;
        }),
        ...unusedFilters,
    ];
}

function filterIntersection(intersection: DrillEventIntersectionElementHeader): boolean {
    const attributeItem = isDrillIntersectionAttributeItem(intersection) ? intersection : undefined;

    return attributeItem ? !attributeItem?.attributeHeader.granularity : false;
}
