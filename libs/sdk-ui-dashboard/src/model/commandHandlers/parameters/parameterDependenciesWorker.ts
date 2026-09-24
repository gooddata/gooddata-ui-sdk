// (C) 2026 GoodData Corporation

import { type Action, createAction } from "@reduxjs/toolkit";
import { uniqBy } from "lodash-es";
import { type BatchAction, batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { type IInsight, type IdentifierRef, serializeObjRef } from "@gooddata/sdk-model";

import {
    selectCatalogParameterDependencies,
    selectCatalogParameterDependenciesStatus,
    selectCatalogRequestedParameterRoots,
} from "../../store/catalog/catalogSelectors.js";
import { catalogActions } from "../../store/catalog/index.js";
import { insightsActions } from "../../store/insights/index.js";
import { selectFiltersByTab } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { collectFilterParameterRoots } from "../../store/tabs/parameters/parametersHelpers.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";

import { insightRoots, loadParameterDependencies } from "./loadParameterDependencies.js";

const TABS_ACTION_PREFIX = `${tabsActions.setTabs.type.split("/")[0]}/`;

export const requestParameterDependencies = createAction<IdentifierRef[]>("parameterDependencies/request");

interface IParameterDependencyGeneration {
    current: number;
}

export function newParameterDependenciesWorker() {
    return function* parameterDependenciesWorker(ctx: DashboardContext): SagaIterator<void> {
        const generation: IParameterDependencyGeneration = { current: 0 };
        yield takeEvery(writesParameterDependencyInputs, function* onInputsWritten(action: Action) {
            yield call(updateParameterDependencies, ctx, generation, action);
        });
    };
}

function* updateParameterDependencies(
    ctx: DashboardContext,
    generation: IParameterDependencyGeneration,
    action: Action,
): SagaIterator<void> {
    const actions = unbatched(action);
    if (actions.some(catalogActions.setCatalogParameterDependencies.match)) {
        generation.current += 1;
    }

    const explicitlyRequestedRoots = actions.flatMap(requestedRootsOf);
    const status: ReturnType<typeof selectCatalogParameterDependenciesStatus> = yield select(
        selectCatalogParameterDependenciesStatus,
    );
    if (status !== "loaded") {
        if (explicitlyRequestedRoots.length > 0) {
            yield put(catalogActions.markParameterDependenciesFailed(explicitlyRequestedRoots));
        }
        return;
    }
    const known: ReturnType<typeof selectCatalogParameterDependencies> = yield select(
        selectCatalogParameterDependencies,
    );
    const requested: ReturnType<typeof selectCatalogRequestedParameterRoots> = yield select(
        selectCatalogRequestedParameterRoots,
    );
    const refreshRoots = insightRoots(actions.flatMap(writtenInsightsOf));
    const requestedRoots = [
        ...insightRoots(actions.flatMap(replacedInsightsOf)),
        ...explicitlyRequestedRoots,
    ];
    if (actions.some(writesTabs)) {
        const filtersByTab: ReturnType<typeof selectFiltersByTab> = yield select(selectFiltersByTab);
        requestedRoots.push(...collectFilterParameterRoots(Object.values(filtersByTab).flat()));
    }
    const unknownRoots = requestedRoots.filter((root) => {
        const key = serializeObjRef(root);
        return !(key in known) && !(key in requested);
    });
    const roots = uniqBy([...refreshRoots, ...unknownRoots], serializeObjRef);
    yield call(loadAndMergeParameterDependencies, ctx, generation, roots);
}

function* loadAndMergeParameterDependencies(
    ctx: DashboardContext,
    generation: IParameterDependencyGeneration,
    roots: IdentifierRef[],
): SagaIterator<void> {
    if (roots.length === 0) {
        return;
    }
    const requestGeneration = generation.current;
    yield put(catalogActions.markParameterDependenciesPending(roots));
    const loaded: PromiseFnReturnType<typeof loadParameterDependencies> = yield call(
        loadParameterDependencies,
        ctx,
        roots,
    );
    if (generation.current !== requestGeneration) {
        return;
    }
    yield put(
        batchActions([
            catalogActions.mergeCatalogParameterDependencies(loaded.byRoot),
            catalogActions.markParameterDependenciesFailed(loaded.failedRoots),
        ]),
    );
}

function writesParameterDependencyInputs(action: Action): boolean {
    return unbatched(action).some(
        (item) =>
            catalogActions.setCatalogParameterDependencies.match(item) ||
            requestParameterDependencies.match(item) ||
            writtenInsightsOf(item).length > 0 ||
            replacedInsightsOf(item).length > 0 ||
            writesTabs(item),
    );
}

function requestedRootsOf(action: Action): IdentifierRef[] {
    return requestParameterDependencies.match(action) ? action.payload : [];
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

function replacedInsightsOf(action: Action): IInsight[] {
    return insightsActions.setInsights.match(action) ? entityPayloadInsights(action.payload) : [];
}

function entityPayloadInsights(payload: readonly IInsight[] | Record<string, IInsight>): IInsight[] {
    return Array.isArray(payload) ? [...payload] : Object.values(payload);
}

function writesTabs(action: Action): boolean {
    return action.type.startsWith(TABS_ACTION_PREFIX);
}

function unbatched(action: Action): Action[] {
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
