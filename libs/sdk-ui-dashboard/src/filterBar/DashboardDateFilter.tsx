// (C) 2021 GoodData Corporation

import { IDashboardDateFilter } from "@gooddata/sdk-backend-spi";
import React from "react";

/**
 * Defines interface between filter bar and date filter implementation
 *
 * @internal
 */
export interface IDashboardDateFilterProps {
    /**
     * Definition of filter to render.
     */
    filter: IDashboardDateFilter;

    /**
     * When the user interacts with the filter and changes its value, it MUST use this callback to propagate the
     * new filter value.
     *
     * @param filter - new date filter value.
     */
    onFilterChanged: (filter: IDashboardDateFilter) => void;
}

/**
 * Default implementation of the date filter to use on the dashboard's filter bar.
 *
 * This will use SDK's Date Filter implementation. Loading of available presets will happen at this point.
 *
 * @internal
 */
export const DashboardDateFilter: React.FC<IDashboardDateFilterProps> = (
    _props: IDashboardDateFilterProps,
) => {
    return null;
};

/**
 * This implementation of dashboard date filter keeps the filter hidden out of sight. The attribute filter itself
 * will still be in effect.
 *
 * @internal
 */
export const HiddenDashboardDateFilter: React.FC<IDashboardDateFilterProps> = (
    _props: IDashboardDateFilterProps,
) => {
    return null;
};

/**
 * @internal
 */
export type DashboardDateFilterComponent = React.ComponentType<IDashboardDateFilterProps>;
