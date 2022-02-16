// (C) 2021-2022 GoodData Corporation
import React from "react";
import partition from "lodash/partition";
import { isDashboardDateFilter } from "@gooddata/sdk-backend-spi";
import { objRefToString } from "@gooddata/sdk-model";

import {
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterTitle,
    selectIsExport,
    useDashboardSelector,
} from "../../../model";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { DashboardDateFilter, HiddenDashboardDateFilter } from "../dateFilter";
import { IDashboardDateFilterConfig, IFilterBarProps } from "../types";

import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer";
import { HiddenFilterBar } from "./HiddenFilterBar";

/**
 * @alpha
 */
export const DefaultFilterBar = (props: IFilterBarProps): JSX.Element => {
    const { filters, onAttributeFilterChanged, onDateFilterChanged } = props;
    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const isExport = useDashboardSelector(selectIsExport);
    const { DashboardAttributeFilterComponentProvider } = useDashboardComponentsContext();

    if (isExport) {
        return <HiddenFilterBar {...props} />;
    }

    const [[dateFilter], attributeFilters] = partition(filters, isDashboardDateFilter);

    const dateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
        customFilterName,
    };

    return (
        <DefaultFilterBarContainer>
            <div className="dash-filters-date dash-filters-attribute">
                {dateFilterMode === "hidden" ? (
                    <HiddenDashboardDateFilter />
                ) : (
                    <DashboardDateFilter
                        filter={dateFilter}
                        onFilterChanged={onDateFilterChanged}
                        config={dateFilterComponentConfig}
                        readonly={dateFilterMode === "readonly"}
                    />
                )}
            </div>
            {attributeFilters.map((filter) => {
                const AttributeFilter = DashboardAttributeFilterComponentProvider(filter);

                return (
                    <div
                        className="dash-filters-notdate dash-filters-attribute"
                        key={objRefToString(filter.attributeFilter.displayForm)}
                    >
                        <AttributeFilter filter={filter} onFilterChanged={onAttributeFilterChanged} />
                    </div>
                );
            })}
        </DefaultFilterBarContainer>
    );
};
