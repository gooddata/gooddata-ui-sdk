// (C) 2021 GoodData Corporation
import React, { useMemo, useState } from "react";
import { DateFilter } from "@gooddata/sdk-ui-filters";

import { dateFilterOptionToDashboardDateFilter } from "../../../_staging/dashboard/dashboardFilterConverter";
import { matchDateFilterToDateFilterOptionWithPreference } from "../../../_staging/dateFilterConfig/dateFilterOptionMapping";

import {
    DashboardDateFilterPropsProvider,
    useDashboardDateFilterProps,
} from "./DashboardDateFilterPropsContext";
import { IDashboardDateFilterProps } from "./types";

/**
 * @internal
 */
export const DefaultDashboardDateFilterInner = (): JSX.Element => {
    const { filter, onFilterChanged, config, readonly } = useDashboardDateFilterProps();
    const [lastSelectedOptionId, setLastSelectedOptionId] = useState("");
    const { dateFilterOption, excludeCurrentPeriod } = useMemo(
        () =>
            matchDateFilterToDateFilterOptionWithPreference(
                filter,
                config.dateFilterOptions,
                lastSelectedOptionId,
            ),
        [filter, config.dateFilterOptions, lastSelectedOptionId],
    );

    return (
        <DateFilter
            excludeCurrentPeriod={excludeCurrentPeriod}
            selectedFilterOption={dateFilterOption}
            dateFilterMode={readonly ? "readonly" : "active"}
            filterOptions={config.dateFilterOptions}
            availableGranularities={config.availableGranularities}
            customFilterName={config.customFilterName}
            onApply={(option, exclude) => {
                setLastSelectedOptionId(option.localIdentifier);
                onFilterChanged(dateFilterOptionToDashboardDateFilter(option, exclude), {
                    dateFilterOption: option,
                    excludeCurrentPeriod: exclude,
                });
            }}
        />
    );
};

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's DateFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export const DefaultDashboardDateFilter = (props: IDashboardDateFilterProps): JSX.Element => {
    return (
        <DashboardDateFilterPropsProvider {...props}>
            <DefaultDashboardDateFilterInner />
        </DashboardDateFilterPropsProvider>
    );
};
