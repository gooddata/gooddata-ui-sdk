// (C) 2021-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type ExplicitDrill } from "@gooddata/sdk-ui";

import { type IDrillState } from "./drillState.js";
import { type ICrossFilteringItem } from "./types.js";

type DrillReducer<A extends Action> = CaseReducer<IDrillState, A>;

type SetDrillableItemsPayload = { items: ExplicitDrill[]; tabId: string };

const setDrillableItems: DrillReducer<PayloadAction<SetDrillableItemsPayload>> = (state, action) => {
    const { items, tabId } = action.payload;

    if (!state.drillableItems[tabId]) {
        state.drillableItems[tabId] = [];
    }
    state.drillableItems[tabId] = items;
};

type CrossFilterByWidgetPayload = { item: ICrossFilteringItem; tabId: string };

const crossFilterByWidget: DrillReducer<PayloadAction<CrossFilterByWidgetPayload>> = (state, action) => {
    const { item, tabId } = action.payload;

    if (!state.crossFiltering[tabId]) {
        state.crossFiltering[tabId] = [];
    }
    state.crossFiltering[tabId] = [item];
};

const resetCrossFiltering: DrillReducer<PayloadAction<string | undefined>> = (state, action) => {
    if (action.payload) {
        state.crossFiltering[action.payload] = [];
    } else {
        Object.keys(state.crossFiltering).forEach((tabId) => {
            state.crossFiltering[tabId] = [];
        });
    }
};

export const drillReducers = {
    setDrillableItems,
    crossFilterByWidget,
    resetCrossFiltering,
};
