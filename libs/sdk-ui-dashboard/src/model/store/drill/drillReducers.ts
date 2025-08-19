// (C) 2021-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { ExplicitDrill } from "@gooddata/sdk-ui";

import { DrillState } from "./drillState.js";
import { ICrossFilteringItem } from "./types.js";

type DrillReducer<A extends Action> = CaseReducer<DrillState, A>;

const setDrillableItems: DrillReducer<PayloadAction<ExplicitDrill[]>> = (state, action) => {
    state.drillableItems = action.payload;
};

const crossFilterByWidget: DrillReducer<PayloadAction<ICrossFilteringItem>> = (state, action) => {
    state.crossFiltering = [action.payload];
};

const resetCrossFiltering: DrillReducer<Action> = (state) => {
    state.crossFiltering = [];
};

export const drillReducers = {
    setDrillableItems,
    crossFilterByWidget,
    resetCrossFiltering,
};
