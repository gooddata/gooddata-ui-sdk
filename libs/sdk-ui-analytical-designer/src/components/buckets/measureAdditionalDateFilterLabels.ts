// (C) 2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { type Granularity } from "../../models/granularity.js";
import { type IAdditionalDateFilterLabel } from "../../selectors/additional_date_filter_selector.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";

interface IStoredElement {
    title?: string;
    formattedTitle?: string;
    available?: boolean;
}

/** What decides a stored filter's granularity: the date dataset attribute its display form belongs to. */
export interface IDateAttributeGranularitySource {
    dfRef?: ObjRef;
    dateType?: string;
}

/**
 * The metric's additional date filters in the shape the date filter button's label helpers read —
 * the metric counterpart of `getAdditionalDateFiltersLabel`. A filter selecting everything is a
 * no-op and is left out, as in the filter bar.
 */
export const buildMeasureAdditionalDateFilterLabels = (
    additionalDateFilters: ReadonlyArray<IBucketItemMetricFilter>,
    dateAttributes: ReadonlyArray<IDateAttributeGranularitySource>,
): IAdditionalDateFilterLabel[] =>
    additionalDateFilters
        .map((filter): IAdditionalDateFilterLabel => {
            const dateAttribute = dateAttributes.find((attribute) =>
                areObjRefsEqual(attribute.dfRef, filter.displayFormRef),
            );
            const selectedElements = ((filter.selectedElements ?? []) as ReadonlyArray<IStoredElement>).map(
                ({ title, formattedTitle, available }) => ({
                    title,
                    available: available !== false,
                    ...(formattedTitle ? { formattedTitle } : {}),
                }),
            );

            return {
                granularity: dateAttribute?.dateType as Granularity,
                isAllSelected: selectedElements.length === 0,
                isInverted: filter.isInverted ?? true,
                selectionSize: selectedElements.filter((element) => element.available).length,
                selectedElements,
                totalElementsCount: filter.totalElementsCount,
            };
        })
        .filter((label) => !label.isAllSelected && !!label.granularity);
