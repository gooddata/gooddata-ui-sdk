// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";
import partition from "lodash/partition";
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import { DashboardAttributeFilter, DashboardAttributeFilterComponent } from "./DashboardAttributeFilter";
import { DashboardDateFilter, DashboardDateFilterComponent } from "./DashboardDateFilter";
import { objRefToString } from "@gooddata/sdk-model";
import {
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterTitle,
    useDashboardSelector,
} from "../model";

/**
 * @internal
 */
export type CustomAttributeFilterFactory = (
    filter: IDashboardAttributeFilter,
) => DashboardAttributeFilterComponent | undefined;

/**
 * @internal
 */
export interface IDefaultFilterBarProps {
    dateFilterConfig?: {
        /**
         * Optionally specify custom component to use for rendering date filter.
         *
         * If not provided, the default implementation {@link DashboardDateFilter} will be used.
         *
         * @remarks if you want to hide the date filter, you can use the {@link HiddenDashboardDateFilter} implementation.
         */
        Component?: DashboardDateFilterComponent;
    };

    attributeFilterConfig?: {
        /**
         * Optionally specify custom component to use for rendering all attribute filters or a factory function to customize the component
         * per different attribute filter.
         *
         * -  If not provided, the default implementation {@link DashboardAttributeFilter} will be used.
         * -  If factory function is provided and it returns undefined, then the default implementation {@link DashboardAttributeFilter}.
         *    This is useful if you want to customize just one particular filter and keep all other filters the same.
         *
         * @example
         * Here is how to override the component for all filters:
         * ```
         * ComponentFactory: () => MyCustomComponent
         * ```
         *
         * @remarks If you want to hide some or all filters, you can use the {@link HiddenDashboardAttributeFilter} implementation.
         */
        ComponentFactory?: CustomAttributeFilterFactory;
    };
}

/**
 * @internal
 */
export interface IFilterBarProps {
    /**
     * Filters that are set for the dashboard.
     */
    filters: FilterContextItem[];

    /**
     * When value of a filter that is part of the FilterBar changes, the filter bar MUST propagate the event
     * using this callback.
     *
     * @param filter - filter that has changed, undefined if All time filter was selected
     */
    onFilterChanged: (filter: FilterContextItem | undefined) => void;
}

/**
 * @internal
 */
export type FilterBarComponent = ComponentType<IFilterBarProps>;

/**
 * @internal
 */
export const FilterBar: React.FC<IFilterBarProps & IDefaultFilterBarProps> = ({
    filters,
    onFilterChanged,
    attributeFilterConfig,
    dateFilterConfig,
}) => {
    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);

    const DateFilter = dateFilterConfig?.Component ?? DashboardDateFilter;

    const [[dateFilter], attributeFilters] = partition(filters, isDashboardDateFilter);

    return (
        <div>
            <DateFilter
                filter={dateFilter}
                onFilterChanged={onFilterChanged}
                availableGranularities={availableGranularities}
                customFilterName={customFilterName}
                dateFilterOptions={dateFilterOptions}
                readonly={dateFilterMode === "readonly"}
            />
            {attributeFilters.map((filter) => {
                const AttributeFilter =
                    attributeFilterConfig?.ComponentFactory?.(filter) ?? DashboardAttributeFilter;

                return (
                    <AttributeFilter
                        key={objRefToString(filter.attributeFilter.displayForm)}
                        filter={filter}
                        onFilterChanged={onFilterChanged}
                    />
                );
            })}
        </div>
    );
};

/**
 * This implementation of Filter Bar will ensure that all the filter controls are out of sight. All the dashboard
 * filtering is still in place however user cannot see or interact with the filters.
 *
 * @internal
 */
export const HiddenFilterBar: React.FC<IFilterBarProps> = (_props: IFilterBarProps) => {
    return null;
};
