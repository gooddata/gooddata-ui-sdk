// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import {
    DateFilterGranularity,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import { IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";

///
/// Auxiliary types
///

/**
 * Defines the configuration of the DateFilter component.
 *
 * @internal
 */
export interface IDashboardDateFilterConfig {
    /**
     * Granularities available in the Floating range form.
     */
    availableGranularities: DateFilterGranularity[];

    /**
     * A {@link @gooddata/sdk-ui-filters#IDateFilterOptionsByType} configuration of the Date Filter.
     */
    dateFilterOptions: IDateFilterOptionsByType;

    /**
     * Optionally specify custom filter name. Defaults to "Date range" (or its localized equivalent).
     */
    customFilterName?: string;
}

/**
 * @internal
 */
export type CustomAttributeFilterFactory = (
    filter: IDashboardAttributeFilter,
) => CustomDashboardAttributeFilterComponent | undefined;

///
/// Core props
///

/**
 * The necessary props a component must be able to handle for it to be usable as a FilterBar.
 * @internal
 */
export interface IFilterBarCoreProps {
    /**
     * Filters that are set for the dashboard.
     */
    filters: FilterContextItem[];

    /**
     * When value of a filter that is part of the FilterBar changes, the filter bar MUST propagate the event
     * using this callback.
     *
     * @param filter - filter that has changed, undefined if All time date filter was selected
     */
    onFilterChanged: (filter: FilterContextItem | undefined) => void;
}

/**
 * The necessary props a component must be able to handle for it to be usable as a DashboardAttributeFilter.
 *
 * @internal
 */
export interface IDashboardAttributeFilterCoreProps {
    /**
     * Definition of filter to render.
     */
    filter: IDashboardAttributeFilter;

    /**
     * When the user interacts with the filter and changes its value, it MUST use this callback to propagate the
     * new filter value.
     *
     * @param filter - new attribute filter value.
     */
    onFilterChanged: (filter: IDashboardAttributeFilter) => void;
}

/**
 * The necessary props a component must be able to handle for it to be usable as a DashboardDateFilter.
 *
 * @internal
 */
export interface IDashboardDateFilterCoreProps {
    /**
     * Definition of filter to render.
     */
    filter: IDashboardDateFilter | undefined;

    /**
     * When the user interacts with the filter and changes its value, it MUST use this callback to propagate the
     * new filter value.
     *
     * @param filter - new date filter value.
     */
    onFilterChanged: (filter: IDashboardDateFilter | undefined) => void;

    /**
     * Additional DateFilter configuration.
     */
    config?: IDashboardDateFilterConfig;

    /**
     * Optionally specify whether the filter should be readonly.
     */
    readonly?: boolean;
}

///
/// Custom component types
///

/**
 * @internal
 */
export type CustomFilterBarComponent = ComponentType<IFilterBarCoreProps>;

/**
 * @internal
 */
export type CustomDashboardAttributeFilterComponent = ComponentType<IDashboardAttributeFilterCoreProps>;

/**
 * @internal
 */
export type CustomDashboardDateFilterComponent = ComponentType<IDashboardDateFilterCoreProps>;

///
/// Default component props
///

/**
 * Props of the default FilterBar implementation: {@link DefaultFilterBar}.
 * @internal
 */
export interface IDefaultFilterBarProps extends IFilterBarCoreProps {
    dateFilterConfig?: {
        /**
         * Optionally specify custom component to use for rendering date filter.
         *
         * If not provided, the default implementation {@link DefaultDashboardDateFilter} will be used.
         *
         * @remarks if you want to hide the date filter, you can use the {@link HiddenDashboardDateFilter} implementation.
         */
        Component?: CustomDashboardDateFilterComponent;
    };

    attributeFilterConfig?: {
        /**
         * Optionally specify custom component to use for rendering all attribute filters or a factory function to customize the component
         * per different attribute filter.
         *
         * -  If not provided, the default implementation {@link DefaultDashboardAttributeFilter} will be used.
         * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardAttributeFilter}.
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
 * Props of the default DashboardAttributeFilter implementation: {@link DefaultDashboardAttributeFilter}.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDefaultDashboardAttributeFilterProps extends IDashboardAttributeFilterCoreProps {}

/**
 * Props of the default DashboardDateFilter implementation: {@link DefaultDashboardDateFilter}.
 * @internal
 */
export interface IDefaultDashboardDateFilterProps extends IDashboardDateFilterCoreProps {
    /**
     * Additional DateFilter configuration.
     */
    config: IDashboardDateFilterConfig;
}
