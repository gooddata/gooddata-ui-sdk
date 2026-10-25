// (C) 2026 GoodData Corporation

import { areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";

import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { metricAttributeFilter } from "../../models/decorated_metric_attribute_filter.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IDateAttributeWithDisplayForm } from "../filter_bar/filter_bar_helpers.js";
import { type IAttributeElement, type IAttributeFilter } from "../filter_bar/filter_bar_types.js";

/**
 * A metric's ADDITIONAL date filters are its attribute filters on a date dataset's own attributes
 * (the day-of-week / month-of-year display forms) — the same rule the filter bar applies to its items
 * in `pickAdditionalDateAttributeFilters`. Nothing on the stored filter marks them; the display form
 * decides.
 */
export const isMetricAdditionalDateFilter = (
    filter: IBucketItemMetricFilter,
    dateDatasetAttributes: ReadonlyArray<IDateAttributeWithDisplayForm>,
): boolean =>
    filter?.attribute !== DATE_DATASET_ATTRIBUTE &&
    !!filter?.displayFormRef &&
    dateDatasetAttributes.some((attribute) => areObjRefsEqual(attribute.dfRef, filter.displayFormRef));

export const pickMetricAdditionalDateFilters = (
    filters: ReadonlyArray<IBucketItemMetricFilter> | undefined,
    dateDatasetAttributes: ReadonlyArray<IDateAttributeWithDisplayForm>,
): IBucketItemMetricFilter[] =>
    (filters ?? []).filter((filter) => isMetricAdditionalDateFilter(filter, dateDatasetAttributes));

/**
 * The stored metric filter in the shape the filter bar's additional-date-filter components edit.
 * A filter stored without a local identifier is keyed by its display form: a date attribute is
 * filtered at most once per metric, so the key stays unique.
 */
export const metricFilterToAttributeFilter = (filter: IBucketItemMetricFilter): IAttributeFilter => ({
    type: "attribute",
    localIdentifier: filter.localIdentifier ?? objRefToString(filter.displayFormRef),
    cacheItemIdentifier: filter.attribute,
    displayFormRef: filter.displayFormRef,
    filterConfig: {
        selectedElements: (filter.selectedElements ?? []) as ReadonlyArray<IAttributeElement>,
        isInverted: filter.isInverted ?? true,
        totalElementsCount: filter.totalElementsCount ?? 0,
    },
});

const attributeFilterToMetricFilter = (
    filter: IAttributeFilter,
    stored: IBucketItemMetricFilter | undefined,
): IBucketItemMetricFilter =>
    metricAttributeFilter({
        ...stored,
        localIdentifier: stored?.localIdentifier ?? filter.localIdentifier,
        attribute: filter.cacheItemIdentifier,
        displayFormRef: filter.displayFormRef,
        selectedElements: filter.filterConfig?.selectedElements ?? [],
        isInverted: filter.filterConfig?.isInverted ?? true,
        totalElementsCount: filter.filterConfig?.totalElementsCount ?? 0,
    });

const findByDisplayForm = <T extends { displayFormRef?: IBucketItemMetricFilter["displayFormRef"] }>(
    filters: ReadonlyArray<T>,
    displayFormRef: IBucketItemMetricFilter["displayFormRef"],
): T | undefined => filters.find((filter) => areObjRefsEqual(filter.displayFormRef, displayFormRef));

export interface IMetricAdditionalDateFiltersReplacement {
    filters: IBucketItemMetricFilter[];
    /** the stored additional filters `next` no longer contains */
    removed: IBucketItemMetricFilter[];
    /** the entries of `next` that were not stored before */
    added: IBucketItemMetricFilter[];
}

/**
 * Replaces the metric's additional date filters with `next`, keeping every other filter and the
 * identity of the additional ones that stay (matched by display form, so an edited selection
 * patches the stored filter instead of replacing it).
 */
export const replaceMetricAdditionalDateFilters = (
    filters: ReadonlyArray<IBucketItemMetricFilter> | undefined,
    next: ReadonlyArray<IAttributeFilter>,
    dateDatasetAttributes: ReadonlyArray<IDateAttributeWithDisplayForm>,
): IMetricAdditionalDateFiltersReplacement => {
    const current = filters ?? [];
    const stored = pickMetricAdditionalDateFilters(current, dateDatasetAttributes);
    const kept = current.filter((filter) => !isMetricAdditionalDateFilter(filter, dateDatasetAttributes));

    const replaced = next.map((filter) =>
        attributeFilterToMetricFilter(filter, findByDisplayForm(stored, filter.displayFormRef)),
    );
    const removed = stored.filter((filter) => !findByDisplayForm(next, filter.displayFormRef));
    const added = replaced.filter((filter) => !findByDisplayForm(stored, filter.displayFormRef));

    return { filters: [...kept, ...replaced], removed, added };
};
