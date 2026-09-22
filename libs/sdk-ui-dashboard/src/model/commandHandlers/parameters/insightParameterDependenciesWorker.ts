// (C) 2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";
import { type BatchAction } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { type IInsight, insightRef, serializeObjRef } from "@gooddata/sdk-model";

import {
    selectCatalogInsightParameters,
    selectCatalogInsightParametersStatus,
} from "../../store/catalog/catalogSelectors.js";
import { catalogActions } from "../../store/catalog/index.js";
import { insightsActions } from "../../store/insights/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";

import { loadInsightParameterDependencies } from "./loadInsightParameterDependencies.js";

export function newInsightParameterDependenciesWorker() {
    return function* insightParameterDependenciesWorker(ctx: DashboardContext): SagaIterator<void> {
        yield takeEvery(writesInsights, function* onInsightsWritten(action: Action): SagaIterator<void> {
            yield call(registerInsightParameterDependencies, ctx, action);
        });
    };
}

function* registerInsightParameterDependencies(ctx: DashboardContext, action: Action): SagaIterator<void> {
    const status: ReturnType<typeof selectCatalogInsightParametersStatus> = yield select(
        selectCatalogInsightParametersStatus,
    );
    if (status !== "loaded") {
        return;
    }
    const known: ReturnType<typeof selectCatalogInsightParameters> = yield select(
        selectCatalogInsightParameters,
    );
    const insights = [
        ...writtenInsights(action),
        ...replacedInsights(action).filter((insight) => !(serializeObjRef(insightRef(insight)) in known)),
    ];
    if (insights.length === 0) {
        return;
    }
    const dependencies: PromiseFnReturnType<typeof loadInsightParameterDependencies> = yield call(
        loadInsightParameterDependencies,
        ctx,
        insights,
        true,
    );
    if (dependencies.status === "loaded") {
        yield put(catalogActions.mergeCatalogInsightParameters(dependencies.byInsight));
    }
}

function writesInsights(action: Action): boolean {
    return writtenInsights(action).length > 0 || replacedInsights(action).length > 0;
}

function writtenInsights(action: Action): IInsight[] {
    return unbatched(action).flatMap(writtenInsightsOf);
}

function writtenInsightsOf(action: Action): IInsight[] {
    if (insightsActions.addInsights.match(action)) {
        return entityPayloadInsights(action.payload);
    }
    if (insightsActions.upsertInsight.match(action)) {
        return [action.payload];
    }
    return [];
}

function replacedInsights(action: Action): IInsight[] {
    return unbatched(action).flatMap(replacedInsightsOf);
}

function replacedInsightsOf(action: Action): IInsight[] {
    return insightsActions.setInsights.match(action) ? entityPayloadInsights(action.payload) : [];
}

function entityPayloadInsights(payload: readonly IInsight[] | Record<string, IInsight>): IInsight[] {
    return Array.isArray(payload) ? [...payload] : Object.values(payload);
}

/**
 * The plain actions an action stands for: itself, or the (recursively unbatched) members of a batch.
 *
 * @internal
 */
export function unbatched(action: Action): Action[] {
    return isBatchAction(action) ? action.payload.flatMap(unbatched) : [action];
}

function isBatchAction(action: Action): action is BatchAction {
    return (
        "meta" in action &&
        typeof action.meta === "object" &&
        action.meta !== null &&
        "batch" in action.meta &&
        action.meta.batch === true
    );
}
