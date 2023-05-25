// (C) 2021-2022 GoodData Corporation
import { useMemo } from "react";
import { invariant } from "ts-invariant";
import { IAttributeFilter, ObjRef, IDashboardAttributeFilter } from "@gooddata/sdk-model";

import { dashboardAttributeFilterToAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { selectFilterContextAttributeFilters, useDashboardSelector } from "../../../model/index.js";
import { IAttributeFilterBaseProps } from "@gooddata/sdk-ui-filters";

/**
 * Result of the {@link useParentFilters} hook, that can be used as parent filtering input props for {@link @gooddata/sdk-ui-filters#AttributeFilter}.
 *
 * @public
 */
export type UseParentFiltersResult = Pick<
    IAttributeFilterBaseProps,
    "parentFilters" | "parentFilterOverAttribute"
>;

/**
 * Returns parent filtering input props for {@link @gooddata/sdk-ui-filters#AttributeFilter} for particular dashboard attribute filter.
 *
 * @param filter - dashboard filter to get the parent filter-related data
 *
 * @public
 */
export const useParentFilters = (filter: IDashboardAttributeFilter): UseParentFiltersResult => {
    const allAttributeFilters = useDashboardSelector(selectFilterContextAttributeFilters);

    const parentFiltersData = useMemo(() => {
        return filter.attributeFilter.filterElementsBy?.map((parent) => {
            const matchingFilter = allAttributeFilters.find(
                (filter) => filter.attributeFilter.localIdentifier === parent.filterLocalIdentifier,
            );

            invariant(matchingFilter); // if this blows up, the state is inconsistent

            return { filter: matchingFilter, over: parent.over.attributes[0] };
        });
    }, [allAttributeFilters, filter.attributeFilter.filterElementsBy]);

    const parentFilters = useMemo(() => {
        return parentFiltersData?.map((item) => dashboardAttributeFilterToAttributeFilter(item.filter));
    }, [parentFiltersData]);

    const parentOverLookup = useMemo(() => {
        // no parents -> no need for the lookup function
        if (!parentFiltersData) {
            return undefined;
        }

        return (_parentFilter: IAttributeFilter, index: number): ObjRef => parentFiltersData[index].over;
    }, [parentFiltersData]);

    return {
        parentFilters,
        parentFilterOverAttribute: parentOverLookup,
    };
};
