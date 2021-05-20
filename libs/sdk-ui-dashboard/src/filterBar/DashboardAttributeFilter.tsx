// (C) 2021 GoodData Corporation

import { IDashboardAttributeFilter } from "@gooddata/sdk-backend-spi";
import React from "react";

/**
 * Defines interface between filter bar and attribute filter implementation
 *
 * @internal
 */
export interface IDashboardAttributeFilterProps {
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
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's AttributeFilter with the button styled same as we have it today on KD.
 *
 * @param _props
 * @constructor
 * @internal
 */
export const DashboardAttributeFilter: React.FC<IDashboardAttributeFilter> = (
    _props: IDashboardAttributeFilter,
) => {
    return null;
};

/**
 * This implementation of dashboard attribute filter keeps the filter hidden out of sight. The attribute filter itself
 * will still be in effect.
 *
 * @param _props
 * @constructor
 */
export const HiddenDashboardAttributeFilter: React.FC<IDashboardAttributeFilter> = (
    _props: IDashboardAttributeFilter,
) => {
    return null;
};

/**
 * @internal
 */
export type DashboardAttributeFilterComponent = React.ComponentType<IDashboardAttributeFilterProps>;
