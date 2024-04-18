// (C) 2023-2024 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { PredictionResult } from "../../commands/index.js";
import { predictionActions } from "../../store/prediction/index.js";

export function* predictionHandler(_ctx: DashboardContext, cmd: PredictionResult): SagaIterator<void> {
    yield put(predictionActions.setPredictionResult(cmd.payload));
}
