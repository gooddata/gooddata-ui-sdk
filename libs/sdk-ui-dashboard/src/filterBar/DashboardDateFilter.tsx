// (C) 2021 GoodData Corporation

import React, { useMemo, useState } from "react";
import { DateFilterGranularity, IDashboardDateFilter } from "@gooddata/sdk-backend-spi";
import { DateFilter, IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";
import { dateFilterOptionToDashboardDateFilter } from "../model/_staging/dashboard/dashboardFilterConverter";
import { matchDateFilterToDateFilterOptionWithPreference } from "../model/_staging/dateFilterConfig/dateFilterOptionMapping";

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
 * Defines interface between filter bar and date filter implementation
 *
 * @internal
 */
export interface IDashboardDateFilterProps {
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
    config: IDashboardDateFilterConfig;

    /**
     * Optionally specify whether the filter should be readonly.
     */
    readonly?: boolean;
}

/**
 * Default implementation of the date filter to use on the dashboard's filter bar.
 *
 * This will use SDK's Date Filter implementation. Loading of available presets will happen at this point.
 *
 * @internal
 */
export const DashboardDateFilter: React.FC<IDashboardDateFilterProps> = ({
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

/**
 * This implementation of dashboard date filter keeps the filter hidden out of sight. The attribute filter itself
 * will still be in effect.
 *
 * @internal
 */
export const HiddenDashboardDateFilter: React.FC = (_props) => {
    return null;
};

/**
 * @internal
 */
export type DashboardDateFilterComponent = React.ComponentType<IDashboardDateFilterProps>;
