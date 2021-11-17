// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { DateFilterGranularity, IDashboardDateFilter } from "@gooddata/sdk-backend-spi";
import { IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";

/**
 * Defines the configuration of the DateFilter component.
 *
 * @alpha
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
 * @alpha
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
     * @param filter - new date filter value
     * @param dateFilterOptionLocalId - localId of the {@link @gooddata/sdk-backend-spi#IDateFilterOption} selected
     */
    onFilterChanged: (filter: IDashboardDateFilter | undefined, dateFilterOptionLocalId?: string) => void;

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
 * @alpha
 */
export type CustomDashboardDateFilterComponent = ComponentType<IDashboardDateFilterProps>;
