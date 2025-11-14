// (C) 2023-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";

import { IDashboardDateFilterConfigItem, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import {
    SetDashboardDateFilterWithDimensionConfigModePayload,
    SetDateFilterConfigTitlePayload,
} from "../../../../model/commands/dashboard.js";
import { TabsState, getActiveTab } from "../tabsState.js";

type DateFilterConfigReducer<A extends Action> = CaseReducer<TabsState, A>;

/**
 * Changes the config mode for the date filter given by its data seet.
 */
const changeDateFilterConfigsMode: DateFilterConfigReducer<
    PayloadAction<SetDashboardDateFilterWithDimensionConfigModePayload>
> = (state, action) => {
    const { dataSet } = action.payload;

    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.dateFilterConfigs) {
        activeTab.dateFilterConfigs = { dateFilterConfigs: [] };
    }
    const effectiveFilter = activeTab.dateFilterConfigs.dateFilterConfigs?.find((item) =>
        areObjRefsEqual(item.dateDataSet, dataSet),
    );

    if (effectiveFilter) {
        if (action.payload.mode) {
            effectiveFilter.config.mode = action.payload.mode;
            activeTab.dateFilterConfigs.dateFilterConfigs = [
                ...(activeTab.dateFilterConfigs.dateFilterConfigs ?? []),
            ];
        }
    } else {
        const newConfigItem: IDashboardDateFilterConfigItem = {
            dateDataSet: dataSet,
            config: {
                filterName: "",
                mode: action.payload.mode || "active",
            },
        };
        activeTab.dateFilterConfigs.dateFilterConfigs = [
            ...(activeTab.dateFilterConfigs.dateFilterConfigs || []),
            newConfigItem,
        ];
    }
};

/**
 * Changes the config title for the filter given by its data set.
 */
const changeDateFilterConfigsTitle: DateFilterConfigReducer<
    PayloadAction<SetDateFilterConfigTitlePayload>
> = (state, action) => {
    const { dataSet } = action.payload;
    invariant(dataSet, "Date data set needs to be provided.");

    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.dateFilterConfigs) {
        activeTab.dateFilterConfigs = { dateFilterConfigs: [] };
    }
    const effectiveFilter = activeTab.dateFilterConfigs.dateFilterConfigs?.find((item) =>
        areObjRefsEqual(item.dateDataSet, dataSet),
    );

    if (effectiveFilter) {
        effectiveFilter.config.filterName = action.payload.title ?? "";
        activeTab.dateFilterConfigs.dateFilterConfigs = [
            ...(activeTab.dateFilterConfigs.dateFilterConfigs ?? []),
        ];
    } else {
        const newConfigItem: IDashboardDateFilterConfigItem = {
            dateDataSet: dataSet,
            config: {
                filterName: action.payload.title ?? "",
                mode: "active",
            },
        };
        activeTab.dateFilterConfigs.dateFilterConfigs = [
            ...(activeTab.dateFilterConfigs.dateFilterConfigs || []),
            newConfigItem,
        ];
    }
};

const setDateFilterConfigs: DateFilterConfigReducer<PayloadAction<any>> = (state, action) => {
    const { dateFilterConfigs } = action.payload;

    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    activeTab.dateFilterConfigs = dateFilterConfigs
        ? {
              dateFilterConfigs,
          }
        : undefined;
};

const removeDateFilterConfigs: DateFilterConfigReducer<PayloadAction<ObjRef>> = (state, action) => {
    if (!state.tabs || !state.activeTabId) {
        return;
    }

    const activeTabIndex = state.tabs?.findIndex((tab) => tab.identifier === state.activeTabId);
    if (activeTabIndex === -1) {
        return;
    }

    const activeTab = state.tabs[activeTabIndex];
    if (activeTab.dateFilterConfigs?.dateFilterConfigs) {
        activeTab.dateFilterConfigs.dateFilterConfigs = activeTab.dateFilterConfigs.dateFilterConfigs.filter(
            (dateFilterConfig) => !areObjRefsEqual(dateFilterConfig.dateDataSet, action.payload),
        );
    }
};

export const dateFilterConfigsReducers = {
    changeDateFilterConfigsMode,
    setDateFilterConfigs,
    removeDateFilterConfigs,
    changeDateFilterConfigsTitle,
};
