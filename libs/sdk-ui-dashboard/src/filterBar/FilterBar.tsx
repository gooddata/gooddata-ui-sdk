// (C) 2021 GoodData Corporation
import React, { ComponentType, useState } from "react";
import { FormattedMessage } from "react-intl";
import Measure from "react-measure";
import partition from "lodash/partition";
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import { DashboardAttributeFilter, DashboardAttributeFilterComponent } from "./DashboardAttributeFilter";
import { DashboardDateFilter, DashboardDateFilterComponent } from "./DashboardDateFilter";
import { objRefToString } from "@gooddata/sdk-model";
import {
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterTitle,
    useDashboardSelector,
} from "../model";
import { IntlWrapper } from "../localization/IntlWrapper";

/**
 * @internal
 */
export type CustomAttributeFilterFactory = (
    filter: IDashboardAttributeFilter,
) => DashboardAttributeFilterComponent | undefined;

const DEFAULT_FILTER_BAR_HEIGHT = 58;

/**
 * @internal
 */
export interface IDefaultFilterBarProps {
    dateFilterConfig?: {
        /**
         * Optionally specify custom component to use for rendering date filter.
         *
         * If not provided, the default implementation {@link DashboardDateFilter} will be used.
         *
         * @remarks if you want to hide the date filter, you can use the {@link HiddenDashboardDateFilter} implementation.
         */
        Component?: DashboardDateFilterComponent;
    };

    attributeFilterConfig?: {
        /**
         * Optionally specify custom component to use for rendering all attribute filters or a factory function to customize the component
         * per different attribute filter.
         *
         * -  If not provided, the default implementation {@link DashboardAttributeFilter} will be used.
         * -  If factory function is provided and it returns undefined, then the default implementation {@link DashboardAttributeFilter}.
         *    This is useful if you want to customize just one particular filter and keep all other filters the same.
         *
         * @example
         * Here is how to override the component for all filters:
         * ```
         * ComponentFactory: () => MyCustomComponent
         * ```
         *
         * @remarks If you want to hide some or all filters, you can use the {@link HiddenDashboardAttributeFilter} implementation.
         */
        ComponentFactory?: CustomAttributeFilterFactory;
    };
}

/**
 * @internal
 */
export interface IFilterBarProps {
    /**
     * Filters that are set for the dashboard.
     */
    filters: FilterContextItem[];

    /**
     * When value of a filter that is part of the FilterBar changes, the filter bar MUST propagate the event
     * using this callback.
     *
     * @param filter - filter that has changed, undefined if All time filter was selected
     */
    onFilterChanged: (filter: FilterContextItem | undefined) => void;
}

/**
 * @internal
 */
export type FilterBarComponent = ComponentType<IFilterBarProps>;

const ShowAllFiltersButton: React.FC<{
    isVisible: boolean;
    isFilterBarExpanded: boolean;
    onToggle: (isExpanded: boolean) => void;
}> = ({ isVisible, isFilterBarExpanded, onToggle }) => {
    if (!isVisible) {
        return null;
    }

    const icon = isFilterBarExpanded ? "gd-icon-chevron-up" : "gd-icon-chevron-down";

    return (
        <div className="show-all">
            <button
                className="button-filter-bar-show-all"
                tabIndex={-1}
                onClick={() => onToggle(!isFilterBarExpanded)}
            >
                <span className="gd-button-text gd-label">
                    <FormattedMessage id={isFilterBarExpanded ? "filterBar.showLess" : "filterBar.showAll"} />
                    <i className={`gd-button-icon gd-icon ${icon}`} />
                </span>
            </button>
        </div>
    );
};

/**
 * @internal
 */
export const FilterBar: React.FC<IFilterBarProps & IDefaultFilterBarProps> = ({
    filters,
    onFilterChanged,
    attributeFilterConfig,
    dateFilterConfig,
}) => {
    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);

    const [filterBarHeight, setFilterBarHeight] = useState(DEFAULT_FILTER_BAR_HEIGHT);
    const [filterBarExpanded, setFilterBarExpanded] = useState(false);

    const DateFilter = dateFilterConfig?.Component ?? DashboardDateFilter;

    const [[dateFilter], attributeFilters] = partition(filters, isDashboardDateFilter);

    const onAttributeFilterBarHeightChange = (val: number) => {
        if (val !== filterBarHeight) {
            setFilterBarHeight(val);
        }
    };

    const areFiltersHidden = Math.round(filterBarHeight) <= DEFAULT_FILTER_BAR_HEIGHT;

    const dashFiltersVisibleStyle = {
        height: filterBarExpanded ? filterBarHeight : DEFAULT_FILTER_BAR_HEIGHT,
    };

    return (
        <IntlWrapper>
            <div className="dash-filters-wrapper">
                <div className="dash-filters-visible" style={dashFiltersVisibleStyle}>
                    <Measure
                        bounds
                        onResize={(dimensions) => onAttributeFilterBarHeightChange(dimensions.bounds!.height)}
                    >
                        {({ measureRef }) => (
                            <div className="dash-filters-all" ref={measureRef}>
                                <div className="dash-filters-date dash-filters-attribute">
                                    <DateFilter
                                        filter={dateFilter}
                                        onFilterChanged={onFilterChanged}
                                        availableGranularities={availableGranularities}
                                        customFilterName={customFilterName}
                                        dateFilterOptions={dateFilterOptions}
                                        readonly={dateFilterMode === "readonly"}
                                    />
                                </div>
                                {attributeFilters.map((filter) => {
                                    const AttributeFilter =
                                        attributeFilterConfig?.ComponentFactory?.(filter) ??
                                        DashboardAttributeFilter;

                                    return (
                                        <div
                                            className="dash-filters-notdate dash-filters-attribute"
                                            key={objRefToString(filter.attributeFilter.displayForm)}
                                        >
                                            <AttributeFilter
                                                filter={filter}
                                                onFilterChanged={onFilterChanged}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Measure>
                </div>
                <ShowAllFiltersButton
                    isFilterBarExpanded={filterBarExpanded}
                    isVisible={!areFiltersHidden}
                    onToggle={(isExpanded) => setFilterBarExpanded(isExpanded)}
                />
            </div>
        </IntlWrapper>
    );
};

/**
 * This implementation of Filter Bar will ensure that all the filter controls are out of sight. All the dashboard
 * filtering is still in place however user cannot see or interact with the filters.
 *
 * @internal
 */
export const HiddenFilterBar: React.FC<IFilterBarProps> = (_props: IFilterBarProps) => {
    return null;
};
