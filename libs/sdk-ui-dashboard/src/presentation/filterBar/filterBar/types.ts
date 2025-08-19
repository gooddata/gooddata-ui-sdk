// (C) 2021-2025 GoodData Corporation
import { ComponentType } from "react";

import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    ObjRef,
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
     * When value of an attribute filter that is part of the FilterBar changes, the filter bar MUST propagate the event
     * using this callback.
     *
     * @param filter - filter that has changed
     */
    onAttributeFilterChanged: (filter: IDashboardAttributeFilter, displayAsLabel?: ObjRef) => void;

    /**
     * When value of a date filter that is part of the FilterBar changes, the filter bar MUST propagate the event
     * using this callback.
     *
     * @param filter - filter that has changed, undefined if All time date filter was selected
     * @param dateFilterOptionLocalId - localId of the {@link @gooddata/sdk-backend-spi#IDateFilterOption} selected
     */
    onDateFilterChanged: (filter: IDashboardDateFilter | undefined, dateFilterOptionLocalId?: string) => void;

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
