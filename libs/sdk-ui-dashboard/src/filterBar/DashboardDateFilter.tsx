// (C) 2021 GoodData Corporation

import { IDashboardDateFilter } from "@gooddata/sdk-backend-spi";
import React from "react";
import { DateFilter } from "@gooddata/sdk-ui-filters";
import { dateFilterOptionToDashboardDateFilter } from "./converters";
import {
    selectEffectiveDateFilterTitle,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterAvailableGranularities,
    useDashboardSelector,
} from "../model";
import { effectiveDateFilterOptionInfoSelector } from "./selectors";

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
    onFilterChanged: (filter: IDashboardDateFilter | undefined) => void;
}

/**
 * Default implementation of the date filter to use on the dashboard's filter bar.
 *
 * This will use SDK's Date Filter implementation. Loading of available presets will happen at this point.
 *
 * @internal
 */
export const DashboardDateFilter: React.FC<IDashboardDateFilterProps> = ({ onFilterChanged }) => {
    const filterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);

    const { dateFilterOption, excludeCurrentPeriod } = useDashboardSelector(
        effectiveDateFilterOptionInfoSelector,
    );

    return (
        <DateFilter
            excludeCurrentPeriod={excludeCurrentPeriod}
            selectedFilterOption={dateFilterOption}
            dateFilterMode={dateFilterMode}
            filterOptions={filterOptions}
            availableGranularities={availableGranularities}
            customFilterName={customFilterName}
            onApply={(option, exclude) =>
                onFilterChanged(dateFilterOptionToDashboardDateFilter(option, exclude))
            }
        />
    );
};

/**
 * This implementation of dashboard date filter keeps the filter hidden out of sight. The attribute filter itself
 * will still be in effect.
 *
 * @internal
 */
export const HiddenDashboardDateFilter: React.FC<IDashboardDateFilterProps> = (_props) => {
    return null;
};

/**
 * @internal
 */
export type DashboardDateFilterComponent = React.ComponentType<IDashboardDateFilterProps>;
