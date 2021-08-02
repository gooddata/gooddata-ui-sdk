// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { FilterContextItem } from "@gooddata/sdk-backend-spi";

import { IDateFilterOptionInfo } from "../../../types";

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
     * @param dateFilterOptionInfo - if using a component compatible with {@link @gooddata/sdk-ui-filters#DateFilter}, information about the configuration that was active at the time of the filter change
     */
    onFilterChanged: (
        filter: FilterContextItem | undefined,
        dateFilterOptionInfo?: IDateFilterOptionInfo,
    ) => void;
}

/**
 * @alpha
 */
export type CustomFilterBarComponent = ComponentType;
