// (C) 2021 GoodData Corporation
import React from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import stableStringify from "json-stable-stringify";

import {
    attributeFilterToDashboardAttributeFilter,
    dashboardAttributeFilterToAttributeFilter,
} from "../../../_staging/dashboard/dashboardFilterConverter";

import {
    DashboardAttributeFilterPropsProvider,
    useDashboardAttributeFilterProps,
} from "./DashboardAttributeFilterPropsContext";
import { IDashboardAttributeFilterProps } from "./types";

/**
 * @internal
 */
export const DefaultDashboardAttributeFilterInner = (): JSX.Element => {
    const { filter, onFilterChanged } = useDashboardAttributeFilterProps();
    return (
        <AttributeFilterButton
            // TODO: https://jira.intgdc.com/browse/RAIL-2174
            // AttributeFilterButton is not updated after attribute filter elements change.
            // Same issue is in the AttributeFilter.
            key={stableStringify(filter)}
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
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's AttributeFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export const DefaultDashboardAttributeFilter = (props: IDashboardAttributeFilterProps): JSX.Element => {
    return (
        <DashboardAttributeFilterPropsProvider {...props}>
            <DefaultDashboardAttributeFilterInner />
        </DashboardAttributeFilterPropsProvider>
    );
};
