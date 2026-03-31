// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import {
    type DashboardAttributeFilterItem,
    dashboardAttributeFilterItemLocalIdentifier,
} from "@gooddata/sdk-model";

import { useRelevantFilters } from "../../hooks/useRelevantFilters.js";
import { useKdaState } from "../../providers/KdaState.js";
import { clearSummaryValue } from "../../utils.js";

export function useAttributeFiltersChangeHandler() {
    const { state, setState } = useKdaState();
    const attributeFilters = useRelevantFilters();

    const onChangeAttributeFilter = useCallback(
        (newFilter: DashboardAttributeFilterItem) => {
            const updatedLocalIdentifier = dashboardAttributeFilterItemLocalIdentifier(newFilter);
            const updated = state.attributeFilters.slice().map((f) => {
                if (
                    updatedLocalIdentifier &&
                    dashboardAttributeFilterItemLocalIdentifier(f) === updatedLocalIdentifier
                ) {
                    return newFilter;
                }
                return f;
            });
            setState({
                attributeFilters: updated,
                ...clearSummaryValue(state.definition),
            });
        },
        [setState, state.attributeFilters, state.definition],
    );

    const onDeleteAttributeFilter = useCallback(
        (filter: DashboardAttributeFilterItem) => {
            const updated = state.attributeFilters.slice().filter((s) => s !== filter);
            setState({
                attributeFilters: updated,
                ...clearSummaryValue(state.definition),
            });
        },
        [setState, state.attributeFilters, state.definition],
    );

    return {
        attributeFilters,
        onChangeAttributeFilter,
        onDeleteAttributeFilter,
    };
}
