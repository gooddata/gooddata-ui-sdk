// (C) 2021 GoodData Corporation

import React, { useMemo, useState } from "react";
import { DateFilter } from "@gooddata/sdk-ui-filters";
import { dateFilterOptionToDashboardDateFilter } from "../../model/_staging/dashboard/dashboardFilterConverter";
import { matchDateFilterToDateFilterOptionWithPreference } from "../../model/_staging/dateFilterConfig/dateFilterOptionMapping";
import { IDefaultDashboardDateFilterProps } from "../types";

/**
 * Default implementation of the date filter to use on the dashboard's filter bar.
 *
 * This will use SDK's Date Filter implementation. Loading of available presets will happen at this point.
 *
 * @internal
 */
export const DefaultDashboardDateFilter: React.FC<IDefaultDashboardDateFilterProps> = ({
    filter,
    onFilterChanged,
    config,
    readonly,
}) => {
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
                onFilterChanged(dateFilterOptionToDashboardDateFilter(option, exclude));
            }}
        />
    );
};
