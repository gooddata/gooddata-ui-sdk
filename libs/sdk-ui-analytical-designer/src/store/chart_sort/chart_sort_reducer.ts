// (C) 2022-2026 GoodData Corporation

import { type AppContextActions } from "../../actions/app_context_actions.js";
import { type IOpenReportFinishedAction, openReportFinished } from "../../actions/open_actions.js";
import {
    type InsightContentResetAction,
    isInsightContentResetEvent,
} from "../app_context/application_reset_events.js";

import {
    type ChartSortStoreActionType,
    ChartSortStoreActionTypeKeys,
    type IStoreAppliedChartSortStoreAction,
    type IStoreChartSortConfigStoreAction,
} from "./chart_sort_actions.js";
import { type IChartSortState, defaultChartSortState } from "./chart_sort_state.js";

const storeChartSortConfig = (state: IChartSortState, { payload }: IStoreChartSortConfigStoreAction) => {
    const {
        sortConfig: { defaultSort, availableSorts, supported, disabled, disabledExplanation },
    } = payload;
    return {
        ...state,
        sortConfig: {
            defaultSort,
            availableSorts,
            supported,
            disabled,
            disabledExplanation,
        },
    };
};

const storeAppliedChartSort = (state: IChartSortState, { payload }: IStoreAppliedChartSortStoreAction) => {
    const { appliedSort } = payload;
    return {
        ...state,
        appliedSort,
    };
};

export const chartSortReducer = (
    state = defaultChartSortState,
    action:
        | ChartSortStoreActionType
        | AppContextActions
        | InsightContentResetAction
        | IOpenReportFinishedAction,
) => {
    // the application resets — this replaces the RESET_APPLICATION case AND the
    // transformer's clearInsightContent write; the scopes live in
    // store/app_context/application_reset_events.ts
    if (isInsightContentResetEvent(action)) {
        return defaultChartSortState;
    }

    /**
     * Insight-to-insight navigation is NOT an application reset, so without this the previous chart's
     * `sortConfig` leaks into the opened insight: `canApplyCustomSort` is stale-TRUE, and the empty-config
     * guard in `sagas/ui_extended_reference_point_changed_sagas.ts` stops recognizing the first plug-viz
     * answer — which then overwrites the persisted sort and leaves the insight permanently "unsaved".
     *
     * Only the config: the open saga stores the opened insight's own `appliedSort` just before this action.
     */
    if (openReportFinished.match(action)) {
        return state.sortConfig === defaultChartSortState.sortConfig
            ? state
            : { ...state, sortConfig: defaultChartSortState.sortConfig };
    }

    switch (action.type) {
        case ChartSortStoreActionTypeKeys.STORE_UPDATE_CHART_SORT_CONFIG:
            return storeChartSortConfig(state, action);
        case ChartSortStoreActionTypeKeys.STORE_UPDATE_APPLIED_CHART_SORT:
            return storeAppliedChartSort(state, action);
        default:
            return state;
    }
};
