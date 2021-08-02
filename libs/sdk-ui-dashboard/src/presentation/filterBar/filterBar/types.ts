// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { FilterContextItem } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
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
     * @param filter - filter that has changed, undefined if All time date filter was selected
     * @param dateFilterOptionLocalId - localId of the {@link @gooddata/sdk-backend-spi#IDateFilterOption} selected
     */
    onFilterChanged: (filter: FilterContextItem | undefined, dateFilterOptionLocalId?: string) => void;
}

/**
 * @alpha
 */
export type CustomFilterBarComponent = ComponentType;
