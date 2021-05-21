// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";
import { IDashboardAttributeFilter } from "@gooddata/sdk-backend-spi";
import { DashboardAttributeFilterComponent } from "./DashboardAttributeFilter";
import { DashboardDateFilterComponent } from "./DashboardDateFilter";
import { IDashboardFilter } from "@gooddata/sdk-ui-ext";

/**
 * @internal
 */
export type CustomAttributeFilter =
    | DashboardAttributeFilterComponent
    | ((filter: IDashboardAttributeFilter) => DashboardAttributeFilterComponent | undefined);

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
         * @remarks If you want to hide some or all filters, you can use the {@link HiddenDashboardAttributeFilter} implementation.
         */
        Component?: CustomAttributeFilter;
    };
}

/**
 * @internal
 */
export interface IFilterBarProps {
    /**
     * Filters that are set for the dashboard.
     */
    filters: IDashboardFilter[];

    /**
     * When value of a filter that is part of the FilterBar changes, the filter bar MUST propagate the event
     * using this callback.
     *
     * @param filter - filter that has changed
     */
    onFilterChanged: (filter: IDashboardFilter) => void;
}

/**
 * @internal
 */
export type FilterBarComponent = ComponentType<IFilterBarProps>;

/**
 * @internal
 */
export const FilterBar: React.FC<IFilterBarProps & IDefaultFilterBarProps> = (
    _props: IFilterBarProps & IDefaultFilterBarProps,
) => {
    return null;
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
