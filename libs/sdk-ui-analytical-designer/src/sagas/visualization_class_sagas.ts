// (C) 2007-2026 GoodData Corporation

import { type SagaReturnType, call, put } from "redux-saga/effects";

import { setVisualizationClasses } from "../actions/visualization_class_actions.js";
import { loadVisualizationClasses as apiLoadVisualizationClasses } from "../utils/api.js";

export function* loadVisualizationClasses(projectId: string) {
    const visualizationClasses: SagaReturnType<typeof apiLoadVisualizationClasses> = yield call(
        apiLoadVisualizationClasses,
        projectId,
    );

    yield put(setVisualizationClasses(visualizationClasses));
}
