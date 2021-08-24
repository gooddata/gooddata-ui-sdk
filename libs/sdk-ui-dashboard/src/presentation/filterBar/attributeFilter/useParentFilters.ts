// (C) 2021 GoodData Corporation
import { useMemo } from "react";
import invariant from "ts-invariant";
import { areObjRefsEqual, filterObjRef, IAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { IDashboardAttributeFilter } from "@gooddata/sdk-backend-spi";

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

    // for all parent filters: a map localId -> the filter object
    // this is then used to derive parentFilterOver attributes
    const parentFiltersMap = useMemo(() => {
        if (!filter.attributeFilter.filterElementsBy) {
            return {};
        }
        return filter.attributeFilter.filterElementsBy.reduce(
            (acc: Record<string, IDashboardAttributeFilter>, curr) => {
                const matchingFilter = allAttributeFilters.find(
                    (filter) => filter.attributeFilter.localIdentifier === curr.filterLocalIdentifier,
                );

                invariant(matchingFilter); // if this blows up, the state is inconsistent

                acc[curr.filterLocalIdentifier] = matchingFilter;
                return acc;
            },
            {},
        );
    }, [allAttributeFilters, filter.attributeFilter.filterElementsBy]);

    const parentFilters = useMemo(() => {
        const values = Object.values(parentFiltersMap);
        return values.length > 0 ? values.map(dashboardAttributeFilterToAttributeFilter) : undefined;
    }, [parentFiltersMap]);

    const parentOverLookup = useMemo(() => {
        // no parents -> no need for the lookup function
        if (!filter.attributeFilter.filterElementsBy) {
            return undefined;
        }
        // function looking up the over attribute based on a parent filter object
        // this is so convoluted, because the Dashboard data use localIds to identify parent filters
        // while the AttributeFilterButton uses the IAttributeFilter which do not have localIds
        // so we have to do some "back linking" here
        return (parentFilter: IAttributeFilter): ObjRef => {
            // translate the parent filter back to its original localId...
            const originalLocalId = Object.keys(parentFiltersMap).find((localId) => {
                // we know the refs are of the same type here: both sides of the expression were created using the same source data
                return areObjRefsEqual(
                    parentFiltersMap[localId].attributeFilter.displayForm,
                    filterObjRef(parentFilter),
                );
            });

            invariant(originalLocalId); // if this blows up, the state is inconsistent

            // ...then find the original filterElementsBy item...
            const match = filter.attributeFilter.filterElementsBy!.find(
                (item) => item.filterLocalIdentifier === originalLocalId,
            );

            invariant(match); // if this blows up, the state is inconsistent

            // ...and return its first "over attribute"
            return match.over.attributes[0];
        };
    }, [parentFiltersMap, filter.attributeFilter.filterElementsBy]);

    return {
        parentFilters,
        parentFilterOverAttribute: parentOverLookup,
    };
};
