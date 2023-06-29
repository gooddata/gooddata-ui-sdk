// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { ExplicitDrill } from "@gooddata/sdk-ui";
import { DrillState } from "./drillState.js";

type DrillReducer<A extends Action> = CaseReducer<DrillState, A>;

const setDrillableItems: DrillReducer<PayloadAction<ExplicitDrill[]>> = (state, action) => {
    state.drillableItems = action.payload;
};

export const drillReducers = {
    setDrillableItems,
};
