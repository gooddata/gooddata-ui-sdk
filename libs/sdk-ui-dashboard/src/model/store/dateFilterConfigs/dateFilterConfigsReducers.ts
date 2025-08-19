// (C) 2023-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";

import { IDashboardDateFilterConfigItem, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { DateFilterConfigsState } from "./dateFilterConfigsState.js";
import {
    SetDashboardDateFilterWithDimensionConfigModePayload,
    SetDateFilterConfigTitlePayload,
} from "../../commands/dashboard.js";

type DateFilterConfigReducer<A extends Action> = CaseReducer<DateFilterConfigsState, A>;

/**
 * Changes the config mode for the filter given by its data seet.
 */
const changeMode: DateFilterConfigReducer<
    PayloadAction<SetDashboardDateFilterWithDimensionConfigModePayload>
> = (state, action) => {
    const { dataSet } = action.payload;
    const effectiveFilter = state.dateFilterConfigs?.find((item) =>
        areObjRefsEqual(item.dateDataSet, dataSet),
    );

    if (effectiveFilter) {
        if (action.payload.mode) {
            effectiveFilter.config.mode = action.payload.mode;
            state.dateFilterConfigs = [...(state.dateFilterConfigs ?? [])];
        }
    } else {
        const newConfigItem: IDashboardDateFilterConfigItem = {
            dateDataSet: dataSet,
            config: {
                filterName: "",
                mode: action.payload.mode || "active",
            },
        };
        state.dateFilterConfigs = [...(state.dateFilterConfigs || []), newConfigItem];
    }
};

/**
 * Changes the config title for the filter given by its data set.
 */
const changeTitle: DateFilterConfigReducer<PayloadAction<SetDateFilterConfigTitlePayload>> = (
    state,
    action,
) => {
    const { dataSet } = action.payload;
    invariant(dataSet, "Date data set needs to be provided.");
    const effectiveFilter = state.dateFilterConfigs?.find((item) =>
        areObjRefsEqual(item.dateDataSet, dataSet),
    );

    if (effectiveFilter) {
        effectiveFilter.config.filterName = action.payload.title ?? "";
        state.dateFilterConfigs = [...(state.dateFilterConfigs ?? [])];
    } else {
        const newConfigItem: IDashboardDateFilterConfigItem = {
            dateDataSet: dataSet,
            config: {
                filterName: action.payload.title ?? "",
                mode: "active",
            },
        };
        state.dateFilterConfigs = [...(state.dateFilterConfigs || []), newConfigItem];
    }
};

const setDateFilterConfigs: DateFilterConfigReducer<PayloadAction<DateFilterConfigsState>> = (
    state,
    action,
) => {
    const { dateFilterConfigs } = action.payload;

    state.dateFilterConfigs = dateFilterConfigs;
};

const removeDateFilterConfig: DateFilterConfigReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.dateFilterConfigs = state.dateFilterConfigs?.filter(
        (dateFilterConfig) => !areObjRefsEqual(dateFilterConfig.dateDataSet, action.payload),
    );
};

export const dateFilterConfigsReducers = {
    //setDateFilterConfig,
    changeMode,
    setDateFilterConfigs,
    removeDateFilterConfig,
    changeTitle,
};
