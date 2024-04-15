// (C) 2023-2024 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { IPredictionState, IPredictionResult } from "./predictionState.js";
import { areObjRefsEqual } from "@gooddata/sdk-model";

type PredictionReducer<A extends Action> = CaseReducer<IPredictionState, A>;

const setPredictionResult: PredictionReducer<PayloadAction<IPredictionResult>> = (state, action) => {
    state.predictionResults = state.predictionResults.filter(
        (item) => !areObjRefsEqual(item.widgetRef, action.payload.widgetRef),
    );
    state.predictionResults.push(action.payload);
};

export const predictionReducers = {
    setPredictionResult,
};
