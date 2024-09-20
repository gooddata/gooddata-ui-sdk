// (C) 2024 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";

type AgentSliceState = {
    busy: boolean;
};

export const agentSliceName = "agent";

const initialState: AgentSliceState = {
    busy: false,
};

const agentSlice = createSlice({
    name: agentSliceName,
    initialState,
    reducers: {
        setAgentBusyAction: (state) => {
            state.busy = true;
        },
        setAgentIdleAction: (state) => {
            state.busy = false;
        },
    },
});

export const agentSliceReducer = agentSlice.reducer;
export const { setAgentBusyAction, setAgentIdleAction } = agentSlice.actions;
