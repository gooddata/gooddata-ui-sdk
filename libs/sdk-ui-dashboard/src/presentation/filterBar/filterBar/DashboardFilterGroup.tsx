// (C) 2021-2026 GoodData Corporation

import { type ComponentType, type ReactNode, useCallback } from "react";

import {
    type IDashboardAttributeFilter,
    dashboardFilterLocalIdentifier,
    getSelectedElementsCount,
} from "@gooddata/sdk-model";
import { FilterGroup, type IAttributeFilterProps } from "@gooddata/sdk-ui-filters";

import {
    type FilterBarAttributeFilterIndexed,
    type IFilterBarFilterGroupItem,
    isFilterBarAttributeFilter,
} from "./useFiltersWithAddedPlaceholder.js";
import { convertDashboardAttributeFilterElementsUrisToValues } from "../../../_staging/dashboard/legacyFilterConvertors.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectSupportsElementUris } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../model/store/config/configSelectors.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { DefaultDashboardAttributeFilter } from "../attributeFilter/DefaultDashboardAttributeFilter.js";

/**
 * @alpha
 */
export interface IDashboardFilterGroupProps {
    item: IFilterBarFilterGroupItem;
    onAttributeFilterChanged: (filter: IDashboardAttributeFilter) => void;
}

/**
 * @alpha
 */
export function DashboardFilterGroup(props: IDashboardFilterGroupProps): ReactNode {
    const { item, onAttributeFilterChanged } = props;

    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const attributeFiltersDisplayAsLabelMap = useDashboardSelector(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );

    const getFilterIdentifier = useCallback((filter: FilterBarAttributeFilterIndexed) => {
        return dashboardFilterLocalIdentifier(filter.filter)!;
    }, []);

    const hasSelectedElements = useCallback((filter: FilterBarAttributeFilterIndexed) => {
        return getSelectedElementsCount(filter.filter) > 0;
    }, []);

    const renderFilter = useCallback(
        (
            filter: FilterBarAttributeFilterIndexed,
            AttributeFilterComponent?: ComponentType<IAttributeFilterProps>,
        ) => {
            const displayAsLabel = attributeFiltersDisplayAsLabelMap.get(
                filter.filter.attributeFilter.localIdentifier!,
            );
            return (
                <DefaultDashboardAttributeFilter
                    filter={filter.filter}
                    AttributeFilterComponent={AttributeFilterComponent}
                    onFilterChanged={onAttributeFilterChanged}
                    workingFilter={isApplyAllAtOnceEnabledAndSet ? filter.workingFilter : undefined}
                    displayAsLabel={displayAsLabel}
                />
            );
        },
        [onAttributeFilterChanged, isApplyAllAtOnceEnabledAndSet, attributeFiltersDisplayAsLabelMap],
    );

    const itemFilters = item.filters
        .map((filter): FilterBarAttributeFilterIndexed | undefined => {
            if (!isFilterBarAttributeFilter(filter)) {
                return undefined;
            }
            if (supportElementUris) {
                return filter;
            }
            return { ...filter, filter: convertDashboardAttributeFilterElementsUrisToValues(filter.filter) };
        })
        .filter((filter): filter is FilterBarAttributeFilterIndexed => filter !== undefined);

    return (
        <FilterGroup<FilterBarAttributeFilterIndexed>
            title={item.groupConfig.title}
            filters={itemFilters}
            getFilterIdentifier={getFilterIdentifier}
            hasSelectedElements={hasSelectedElements}
            renderFilter={renderFilter}
        />
    );
}
