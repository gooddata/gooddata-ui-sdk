// (C) 2021-2026 GoodData Corporation

import { type ComponentType } from "react";

import {
    type DashboardAttributeFilterItem,
    type FilterContextItem,
    type IDashboardDateFilter,
    type IDashboardFilterGroupsConfig,
    type IDashboardMeasureValueFilter,
    type MeasureValueFilterCondition,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IFilterBarProps {
    /**
     * Filters that are set for the dashboard.
     */
    filters: FilterContextItem[];

    /**
     * Working filters that are used to dispaly filter selected values. If undefined, filters are used instead.
     */
    workingFilters?: FilterContextItem[];

    /**
     * Filter groups config.
     */
    filterGroupsConfig?: IDashboardFilterGroupsConfig;

    /**
     * When value of an attribute filter that is part of the FilterBar changes, the filter bar MUST propagate the event
     * using this callback.
     *
     * @param filter - filter that has changed
     */
    onAttributeFilterChanged: (filter: DashboardAttributeFilterItem, displayAsLabel?: ObjRef) => void;

    /**
     * When value of a date filter that is part of the FilterBar changes, the filter bar MUST propagate the event
     * using this callback.
     *
     * @param filter - filter that has changed, undefined if All time date filter was selected
     * @param dateFilterOptionLocalId - localId of the {@link @gooddata/sdk-backend-spi#IDateFilterOption} selected
     */
    onDateFilterChanged: (filter: IDashboardDateFilter | undefined, dateFilterOptionLocalId?: string) => void;

    /**
     * When the condition of a dashboard measure value filter changes, the filter bar MUST propagate the event
     * using this callback.
     *
     * @param filter - the dashboard measure value filter being updated
     * @param conditions - the new conditions; empty or undefined means the filter is set to "All"
     */
    onMeasureValueFilterChanged?: (
        filter: IDashboardMeasureValueFilter,
        conditions: MeasureValueFilterCondition[] | undefined,
        isWorkingSelectionChange?: boolean,
    ) => void;

    /**
     * Contains reference to default implementation of the filter bar. If you are implementing a custom
     * filter bar that decorates default filter bar, then use this component to render the default filter
     * bar.
     */
    DefaultFilterBar: ComponentType<IFilterBarProps>;
}

/**
 * @alpha
 */
export type CustomFilterBarComponent = ComponentType<IFilterBarProps>;
