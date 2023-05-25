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
    isRankingFilter,
    mergeFilters,
    IMeasureValueFilter,
    IRankingFilter,
} from "@gooddata/sdk-model";
import partition from "lodash/fp/partition.js";
import zip from "lodash/fp/zip.js";

/**
 * Appends a set of filters to an existing set making sure that all the filters compared regardless of their ObjRef types.
 * Uses {@link mergeFilters} internally, see its docs for details on the merging logic.
 *
 * @param originalFilters - original filter set
 * @param addedFilters - filters to append
 * @param objRefNormalizer - function that converts any ObjRef type to uri
 */
export async function appendFilters(
    originalFilters: IFilter[],
    addedFilters: IFilter[],
    objRefNormalizer: (refs: ObjRef[]) => Promise<string[]>,
): Promise<IFilter[]> {
    const [normalizedOriginalFilters, normalizedAddedFilters] = allUseSameRefType([
        ...originalFilters,
        ...addedFilters,
    ])
        ? [originalFilters, addedFilters]
        : await Promise.all([
              normalizeFilterRefs(originalFilters, objRefNormalizer),
              normalizeFilterRefs(addedFilters, objRefNormalizer),
          ]);

    return mergeFilters(normalizedOriginalFilters, normalizedAddedFilters);
}

const isFilterWithoutRefs = (filter: IFilter): filter is IMeasureValueFilter | IRankingFilter =>
    isMeasureValueFilter(filter) || isRankingFilter(filter);

/**
 * Detects if all the filters with refs use the same ObjRef type.
 *
 * @param filters - the filters to check
 */
function allUseSameRefType(filters: IFilter[]): boolean {
    const filtersWithRefs = filters.filter((f) => !isFilterWithoutRefs(f));

    return (
        filtersWithRefs.every((f) => isIdentifierRef(filterObjRef(f))) ||
        filtersWithRefs.every((f) => isUriRef(filterObjRef(f)))
    );
}

/**
 * Makes sure that all the filters use the same ObjRef type so that they can be compared trivially.
 *
 * @param filters - filters to normalize
 * @param objRefNormalizer - function that converts any ObjRef type to uri
 */
async function normalizeFilterRefs(
    filters: IFilter[],
    objRefNormalizer: (refs: ObjRef[]) => Promise<string[]>,
): Promise<IFilter[]> {
    const [filtersWithoutRefs, filtersWithRefs] = partition(isFilterWithoutRefs, filters);

    const refs = filtersWithRefs.map(filterObjRef) as ObjRef[];

    const uris = await objRefNormalizer(refs);

    const normalized = zip(filtersWithRefs, uris).map(([filter, uri]) => {
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

    return [...filtersWithoutRefs, ...normalized];
}
