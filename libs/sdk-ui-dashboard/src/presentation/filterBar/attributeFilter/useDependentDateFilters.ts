// (C) 2024 GoodData Corporation
import { useMemo } from "react";
import { invariant } from "ts-invariant";
import { IDashboardAttributeFilter, objRefToString } from "@gooddata/sdk-model";

import { selectFilterContextDateFiltersWithDimension, useDashboardSelector } from "../../../model/index.js";
import { IAttributeFilterBaseProps } from "@gooddata/sdk-ui-filters";

/**
 * Result of the {@link useDependentDateFilters} hook, that can be used as dependent date filtering input props for {@link @gooddata/sdk-ui-filters#AttributeFilter}.
 *
 * @beta
 */
export type UseDependentDateFiltersResult = Pick<IAttributeFilterBaseProps, "dependentDateFilters">;

/**
 * Returns depdent date filtering input props for {@link @gooddata/sdk-ui-filters#AttributeFilter} for particular dashboard attribute filter.
 *
 * @param filter - dashboard filter to get the dependent date filter-related data
 *
 * @beta
 */
export const useDependentDateFilters = (filter: IDashboardAttributeFilter): UseDependentDateFiltersResult => {
    const allDateFilters = useDashboardSelector(selectFilterContextDateFiltersWithDimension);

    const dependentDateFilters = useMemo(() => {
        return filter.attributeFilter.filterElementsByDate?.map((parent) => {
            const matchingFilter = allDateFilters.find(
                (filter) => objRefToString(filter.dateFilter.dataSet!) === parent.filterLocalIdentifier,
            );

            invariant(matchingFilter); // if this blows up, the state is inconsistent

            return matchingFilter;
        });
    }, [allDateFilters, filter.attributeFilter.filterElementsByDate]);

    return {
        dependentDateFilters,
    };
};
