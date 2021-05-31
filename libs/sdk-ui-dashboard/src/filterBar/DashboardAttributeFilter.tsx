// (C) 2021 GoodData Corporation

import React from "react";
import { IDashboardAttributeFilter } from "@gooddata/sdk-backend-spi";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";

import {
    attributeFilterToDashboardAttributeFilter,
    dashboardAttributeFilterToAttributeFilter,
} from "./converters";

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
 * @internal
 */
export const DashboardAttributeFilter: React.FC<IDashboardAttributeFilterProps> = ({
    filter,
    onFilterChanged,
}) => {
    return (
        <AttributeFilterButton
            filter={dashboardAttributeFilterToAttributeFilter(filter)}
            onApply={(newFilter) => {
                onFilterChanged(
                    attributeFilterToDashboardAttributeFilter(
                        newFilter,
                        filter.attributeFilter.localIdentifier,
                    ),
                );
            }}
        />
    );
};

/**
 * This implementation of dashboard attribute filter keeps the filter hidden out of sight. The attribute filter itself
 * will still be in effect.
 *
 * @internal
 */
export const HiddenDashboardAttributeFilter: React.FC<IDashboardAttributeFilter> = (_props) => {
    return null;
};

/**
 * @internal
 */
export type DashboardAttributeFilterComponent = React.ComponentType<IDashboardAttributeFilterProps>;
