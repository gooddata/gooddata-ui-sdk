// (C) 2023 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { AttributeFilterConfigsState } from "./attributeFilterConfigsState.js";
import { SetDashboardAttributeFilterConfigModePayload } from "../../../model/commands/dashboard.js";

type AttributeFilterConfigReducer<A extends Action> = CaseReducer<AttributeFilterConfigsState, A>;

/**
 * Changes the config mode for the filter given by its local identifier.
 */
const changeMode: AttributeFilterConfigReducer<
    PayloadAction<SetDashboardAttributeFilterConfigModePayload>
> = (state, action) => {
    const { localIdentifier } = action.payload;
    const effectiveFilter = state.attributeFilterConfigs?.find(
        (item) => item.localIdentifier === localIdentifier,
    );

    if (effectiveFilter) {
        effectiveFilter.mode = action.payload.mode;
        state.attributeFilterConfigs = [...(state.attributeFilterConfigs ?? [])];
    } else {
        state.attributeFilterConfigs = [...(state.attributeFilterConfigs || []), action.payload];
    }
};

const setAttributeFilterConfigs: AttributeFilterConfigReducer<PayloadAction<AttributeFilterConfigsState>> = (
    state,
    action,
) => {
    const { attributeFilterConfigs } = action.payload;

    state.attributeFilterConfigs = attributeFilterConfigs;
};

export const attributeFilterConfigsReducers = {
    changeMode,
    setAttributeFilterConfigs,
};
