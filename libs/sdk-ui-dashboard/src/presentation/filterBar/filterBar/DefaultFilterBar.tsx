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
    selectIsExport,
    useDashboardSelector,
} from "../../../model";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { DashboardAttributeFilterPropsProvider } from "../attributeFilter";
import { DashboardDateFilter, DashboardDateFilterPropsProvider } from "../dateFilter";
import { IDashboardDateFilterConfig, IFilterBarProps } from "../types";

import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer";
import { FilterBarPropsProvider, useFilterBarProps } from "./FilterBarPropsContext";
import { HiddenFilterBar } from "./HiddenFilterBar";

/**
 * @internal
 */
export const DefaultFilterBarInner = (): JSX.Element => {
    const { filters, onAttributeFilterChanged, onDateFilterChanged } = useFilterBarProps();
    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const isExport = useDashboardSelector(selectIsExport);
    const { DashboardAttributeFilterComponentFactory } = useDashboardComponentsContext();

    if (isExport) {
        return <HiddenFilterBar />;
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
                <DashboardDateFilterPropsProvider
                    filter={dateFilter}
                    onFilterChanged={onDateFilterChanged}
                    config={dateFilterComponentConfig}
                    readonly={dateFilterMode === "readonly"}
                >
                    <DashboardDateFilter />
                </DashboardDateFilterPropsProvider>
            </div>
            {attributeFilters.map((filter) => {
                const AttributeFilter = DashboardAttributeFilterComponentFactory(filter);

                return (
                    <div
                        className="dash-filters-notdate dash-filters-attribute"
                        key={objRefToString(filter.attributeFilter.displayForm)}
                    >
                        <DashboardAttributeFilterPropsProvider
                            filter={filter}
                            onFilterChanged={onAttributeFilterChanged}
                        >
                            <AttributeFilter />
                        </DashboardAttributeFilterPropsProvider>
                    </div>
                );
            })}
        </DefaultFilterBarContainer>
    );
};

/**
 * @alpha
 */
export const DefaultFilterBar = (props: IFilterBarProps): JSX.Element => {
    return (
        <FilterBarPropsProvider {...props}>
            <DefaultFilterBarInner />
        </FilterBarPropsProvider>
    );
};
