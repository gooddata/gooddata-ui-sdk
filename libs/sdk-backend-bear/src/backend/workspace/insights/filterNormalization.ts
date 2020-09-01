// (C) 2020 GoodData Corporation
import {
    ObjRef,
    filterObjRef,
    isRelativeDateFilter,
    relativeDateFilterValues,
    isIdentifierRef,
    isUriRef,
    isAbsoluteDateFilter,
    absoluteDateFilterValues,
    newAbsoluteDateFilter,
    uriRef,
    newRelativeDateFilter,
    DateAttributeGranularity,
    IFilter,
    isPositiveAttributeFilter,
    filterAttributeElements,
    newPositiveAttributeFilter,
    newNegativeAttributeFilter,
    isNegativeAttributeFilter,
    isMeasureValueFilter,
} from "@gooddata/sdk-model";
import partition from "lodash/fp/partition";
import zip from "lodash/fp/zip";

/**
 * Makes sure that all the filters use the same ObjRef type so that they can be compared trivially.
 *
 * @param filters - filters to normalize
 * @param objRefsToUris - function that converts any ObjRef type to uri
 */
export async function normalizeFilterRefs(
    filters: IFilter[],
    objRefsToUris: (refs: ObjRef[]) => Promise<string[]>,
): Promise<IFilter[]> {
    const needsNormalization = !(
        filters.every((f) => isIdentifierRef(filterObjRef(f))) ||
        filters.every((f) => isUriRef(filterObjRef(f)))
    );

    if (!needsNormalization) {
        return filters;
    }

    const [measureValueFilters, filtersWithRefs] = partition(isMeasureValueFilter, filters);

    const refs = filtersWithRefs.map(filterObjRef) as ObjRef[];
    const uris = await objRefsToUris(refs);

    const normalized = zip(filters, uris).map((pair) => {
        const [filter, uri] = pair;

        if (isAbsoluteDateFilter(filter)) {
            const { from, to } = absoluteDateFilterValues(filter);
            return newAbsoluteDateFilter(uriRef(uri!), from, to);
        } else if (isRelativeDateFilter(filter)) {
            const { granularity, from, to } = relativeDateFilterValues(filter!);
            return newRelativeDateFilter(uriRef(uri!), granularity as DateAttributeGranularity, from, to);
        } else if (isPositiveAttributeFilter(filter)) {
            const elements = filterAttributeElements(filter);
            return newPositiveAttributeFilter(uriRef(uri!), elements);
        } else if (isNegativeAttributeFilter(filter)) {
            const elements = filterAttributeElements(filter);
            return newNegativeAttributeFilter(uriRef(uri!), elements);
        } else {
            return filter!;
        }
    });

    return [...measureValueFilters, ...normalized];
}
