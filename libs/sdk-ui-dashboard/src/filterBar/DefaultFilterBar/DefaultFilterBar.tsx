// (C) 2021 GoodData Corporation
import React from "react";
import partition from "lodash/partition";
import { isDashboardDateFilter } from "@gooddata/sdk-backend-spi";
import { objRefToString } from "@gooddata/sdk-model";

import {
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterTitle,
    useDashboardSelector,
} from "../../model";

import { DefaultDashboardAttributeFilter } from "./DefaultDashboardAttributeFilter";
import { DefaultDashboardDateFilter } from "./DefaultDashboardDateFilter";
import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer";
import { IDashboardDateFilterConfig, IDefaultFilterBarProps } from "../types";

/**
 * @internal
 */
export const DefaultFilterBar: React.FC<IDefaultFilterBarProps> = ({
    filters,
    onFilterChanged,
    attributeFilterConfig,
    dateFilterConfig,
}) => {
    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);

    const DateFilter = dateFilterConfig?.Component ?? DefaultDashboardDateFilter;

    const [[dateFilter], attributeFilters] = partition(filters, isDashboardDateFilter);

    const dateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
        customFilterName,
    };

    return (
        <DefaultFilterBarContainer>
            <div className="dash-filters-date dash-filters-attribute">
                <DateFilter
                    filter={dateFilter}
                    onFilterChanged={onFilterChanged}
                    config={dateFilterComponentConfig}
                    readonly={dateFilterMode === "readonly"}
                />
            </div>
            {attributeFilters.map((filter) => {
                const AttributeFilter =
                    attributeFilterConfig?.ComponentFactory?.(filter) ?? DefaultDashboardAttributeFilter;

                return (
                    <div
                        className="dash-filters-notdate dash-filters-attribute"
                        key={objRefToString(filter.attributeFilter.displayForm)}
                    >
                        <AttributeFilter filter={filter} onFilterChanged={onFilterChanged} />
                    </div>
                );
            })}
        </DefaultFilterBarContainer>
    );
};
