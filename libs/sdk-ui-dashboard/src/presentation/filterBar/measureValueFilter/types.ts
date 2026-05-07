// (C) 2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IDashboardMeasureValueFilter, type MeasureValueFilterCondition } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IDashboardMeasureValueFilterProps {
    /**
     * Definition of the dashboard measure value filter to render. Always reflects the applied
     * filter — if/when "Apply together" mode for MVF is added, the working state is meant to be
     * resolved internally via dashboard selectors rather than threaded through props.
     */
    filter: IDashboardMeasureValueFilter;

    /**
     * Index of the filter among the other dashboard filters.
     */
    filterIndex: number;

    /**
     * Whether the filter is rendered in read-only mode.
     */
    readonly?: boolean;

    /**
     * Whether the dropdown should automatically open on mount. Used to focus newly added filters.
     */
    autoOpen?: boolean;

    /**
     * Callback fired when the user changes the filter's conditions.
     *
     * @param filter - the dashboard measure value filter being updated
     * @param conditions - the new conditions; empty or undefined means "All"
     */
    onMeasureValueFilterChanged: (
        filter: IDashboardMeasureValueFilter,
        conditions: MeasureValueFilterCondition[] | undefined,
        isWorkingSelectionChange?: boolean,
    ) => void;

    /**
     * Callback fired when the filter dropdown is closed.
     */
    onMeasureValueFilterClose?: () => void;

    /**
     * Optional tab identifier to read filter config from. When provided, the visibility
     * icon and any other tab-scoped state will be sourced from this specific tab. When
     * undefined, the active tab's state is used.
     */
    tabId?: string;
}

/**
 * @alpha
 */
export type CustomDashboardMeasureValueFilterComponent = ComponentType<IDashboardMeasureValueFilterProps>;
