// (C) 2021 GoodData Corporation
import React from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";

import {
    attributeFilterToDashboardAttributeFilter,
    dashboardAttributeFilterToAttributeFilter,
} from "../../model/_staging/dashboard/dashboardFilterConverter";
import { IDefaultDashboardAttributeFilterProps } from "../types";

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's AttributeFilter with the button styled same as we have it today on KD.
 *
 * @internal
 */
export const DefaultDashboardAttributeFilter: React.FC<IDefaultDashboardAttributeFilterProps> = ({
    filter,
    onFilterChanged,
}) => {
    return (
        <AttributeFilterButton
            // TODO: RAIL-3533 - button is not updated after attribute filter elements change
            key={JSON.stringify(filter)}
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
