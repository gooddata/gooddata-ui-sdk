// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { IDashboardAttributeFilter } from "@gooddata/sdk-model";

import { useRelevantFilters } from "../../hooks/useRelevantFilters.js";
import { useKdaState } from "../../providers/KdaState.js";

export function useAttributeFiltersChangeHandler() {
    const { state, setState } = useKdaState();
    const attributeFilters = useRelevantFilters();

    const onChangeAttributeFilter = useCallback(
        (newFilter: IDashboardAttributeFilter) => {
            const updated = state.attributeFilters.slice().map((f) => {
                if (f.attributeFilter.localIdentifier === newFilter.attributeFilter.localIdentifier) {
                    return newFilter;
                }
                return f;
            });
            setState({
                attributeFilters: updated,
            });
        },
        [setState, state.attributeFilters],
    );

    const onDeleteAttributeFilter = useCallback(
        (filter: IDashboardAttributeFilter) => {
            const updated = state.attributeFilters.slice().filter((s) => s !== filter);
            setState({
                attributeFilters: updated,
            });
        },
        [setState, state.attributeFilters],
    );

    return {
        attributeFilters,
        onChangeAttributeFilter,
        onDeleteAttributeFilter,
    };
}
