// (C) 2021-2022 GoodData Corporation
import { useMemo } from "react";
import invariant from "ts-invariant";
import { IAttributeFilter, ObjRef, IDashboardAttributeFilter } from "@gooddata/sdk-model";

import { dashboardAttributeFilterToAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter";
import { selectFilterContextAttributeFilters, useDashboardSelector } from "../../../model";
import { IAttributeFilterButtonProps } from "@gooddata/sdk-ui-filters";

type UseParentFiltersResult = Pick<
    IAttributeFilterButtonProps,
    "parentFilters" | "parentFilterOverAttribute"
>;

/**
 * Returns parent filter-related data to use as AttributeFilterButton props.
 * @param filter - filter to get the parent filter-related data
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
