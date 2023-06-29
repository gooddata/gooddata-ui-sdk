// (C) 2019-2021 GoodData Corporation
import { objRefToString } from "../../objRef/index.js";
import {
    IAttributeFilter,
    IDateFilter,
    IFilter,
    IMeasureValueFilter,
    isAttributeFilter,
    isDateFilter,
    filterObjRef,
    isAllTimeDateFilter,
    IRankingFilter,
    isMeasureValueFilter,
    isRankingFilter,
    INullableFilter,
} from "./index.js";
import compact from "lodash/compact.js";
import groupBy from "lodash/groupBy.js";
import last from "lodash/last.js";
import { invariant } from "ts-invariant";
import values from "lodash/values.js";

type FilterByType = {
    attribute: IAttributeFilter[];
    date: IDateFilter[];
    measureValue: IMeasureValueFilter[];
    ranking: IRankingFilter[];
};

function separateFiltersByType(filters: IFilter[]): FilterByType {
    const result: FilterByType = {
        attribute: [],
        date: [],
        measureValue: [],
        ranking: [],
    };

    filters.forEach((f) => {
        if (isAttributeFilter(f)) {
            result.attribute.push(f);
        } else if (isDateFilter(f)) {
            result.date.push(f);
        } else if (isMeasureValueFilter(f)) {
            result.measureValue.push(f);
        } else if (isRankingFilter(f)) {
            result.ranking.push(f);
        }
        invariant(f, "filter is not supported");
    });

    return result;
}

/**
 * Merges two sets of filters.
 *
 * - Attribute filters and ranking filters from both sets are simply concatenated resulting
 *   in the filters being ANDed together.
 * - Date filters are merged based on date data set they filter on
 *   - For Date filters for the same date data set:
 *     - the filters are ordered putting original filters first
 *     - the last filter in this ordering is taken
 *        - if it is All time, all filters for the dimension are cleared
 *        - else the last filter is used
 * - Measure value filters are merged so that there is at most one Measure value filter per measure
 *   (the last one specified is used). This is to prevent errors with more than one Measure value filter
 *   on the same measure which is not supported.
 *
 * @remarks
 * It is the responsibility of the caller to make sure all the filters use the same ObjRef type so that
 * they can be compared without involving the backend. Otherwise, the results might be unexpected
 * (especially for date filters).
 *
 * There is also a function in backend insights service called getInsightWithAddedFilters that can help you
 * do this that takes care of the ObjRef normalization.
 *
 * @param originalFilters - original filters to merge with
 * @param addedFilters - new filters to add on top of original
 * @internal
 */
export function mergeFilters(
    originalFilters: IFilter[],
    addedFilters: INullableFilter[] | undefined,
): IFilter[] {
    invariant(originalFilters, "original filters must be specified");

    const filtersToMerge = compact(addedFilters ?? []);

    if (!filtersToMerge.length) {
        return originalFilters;
    }

    if (!originalFilters.length) {
        return filtersToMerge.filter((f) => !isAllTimeDateFilter(f));
    }

    const original = separateFiltersByType(originalFilters);
    const added = separateFiltersByType(filtersToMerge);

    // concat attribute filters
    const attributeFilters = [...original.attribute, ...added.attribute];

    // merge date filters by date dataset qualifier
    const dateFilters = mergeDateFilters(original.date, added.date);

    // merge measure value filters by measure
    const measureValueFilters = mergeMeasureValueFilters(original.measureValue, added.measureValue);

    // concat ranking filters
    const rankingFilters = [...original.ranking, ...added.ranking];

    return [...attributeFilters, ...dateFilters, ...measureValueFilters, ...rankingFilters];
}

function mergeDateFilters(originalFilters: IDateFilter[], addedFilters: IDateFilter[]): IDateFilter[] {
    const allFilters = [...originalFilters, ...addedFilters];
    const grouped = groupBy(allFilters, (f) => objRefToString(filterObjRef(f)));
    const mergedFilters: IDateFilter[] = [];

    values(grouped).forEach((filtersForDimension) => {
        // use the last filter for the dimension specified.
        // this makes sure that the added filter wins if it is specified
        const lastFilterForDimension = last(filtersForDimension)!;

        // if the last filter is all time, clear filters for this dimension, otherwise use the last filter
        if (!isAllTimeDateFilter(lastFilterForDimension)) {
            mergedFilters.push(lastFilterForDimension);
        }
    });

    return mergedFilters;
}

function mergeMeasureValueFilters(
    originalFilters: IMeasureValueFilter[],
    addedFilters: IMeasureValueFilter[],
): IMeasureValueFilter[] {
    const allFilters = [...originalFilters, ...addedFilters];
    const grouped = groupBy(allFilters, (f) => objRefToString(f.measureValueFilter.measure));

    return values(grouped).map((filters) => last(filters)!);
}
