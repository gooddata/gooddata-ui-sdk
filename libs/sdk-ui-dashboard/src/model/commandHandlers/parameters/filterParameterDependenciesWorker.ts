// (C) 2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";
import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { serializeObjRef } from "@gooddata/sdk-model";

import {
    selectCatalogFilterParameters,
    selectCatalogFilterParametersStatus,
} from "../../store/catalog/catalogSelectors.js";
import { catalogActions } from "../../store/catalog/index.js";
import { selectFiltersByTab } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { collectFilterParameterRoots } from "../../store/tabs/parameters/parametersHelpers.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";

import { unbatched } from "./insightParameterDependenciesWorker.js";
import { loadReachableParameterMap } from "./loadInsightParameterDependencies.js";

// every filter context write is a `tabs/*` action (the filter contexts live in the tabs slice)
const TABS_ACTION_PREFIX = `${tabsActions.setTabs.type.split("/")[0]}/`;

/**
 * Keeps the dashboard-filter → parameter dependency map complete as the filter contexts change.
 *
 * @remarks
 * Counterpart of {@link newInsightParameterDependenciesWorker} for dashboard filters. After any write
 * to the tabs slice it collects the objects the current filters of every tab read and loads the ones
 * the map does not know yet, so a widget picks up a parameter it now depends on through a filter added
 * or changed after initialization (edit mode, an applied filter view, a new tab). Removing a filter
 * needs nothing: the map is keyed by the object a filter reads, not by the filter, and a widget only
 * consults the entries of the filters it currently has. A failed load leaves the map as it is, so the
 * dependencies known so far stay in effect; the failed roots are not retried until the map is
 * initialized again (a dashboard reload), so a filter on an object the graph rejects does not trigger a
 * request on every later write.
 */
export function newFilterParameterDependenciesWorker() {
    return function* filterParameterDependenciesWorker(ctx: DashboardContext): SagaIterator<void> {
        const tracker = newFilterParameterRootTracker();
        yield takeEvery(catalogActions.setCatalogFilterParameters.match, function onMapReset() {
            tracker.reset();
        });
        yield takeEvery(writesTabs, function* onTabsWritten(): SagaIterator<void> {
            yield call(registerFilterParameterDependencies, ctx, tracker);
        });
    };
}

/**
 * The roots one store has already requested but that are not in the map: those in flight and those whose
 * request failed. Neither is requested again until {@link IFilterParameterRootTracker.reset}, which also
 * starts a new generation so that a request still in flight from before the reset is discarded on
 * completion instead of writing into the freshly initialized map.
 *
 * @internal
 */
export interface IFilterParameterRootTracker {
    pending: Set<string>;
    failed: Set<string>;
    generation: number;
    reset(): void;
}

/**
 * @internal
 */
export function newFilterParameterRootTracker(): IFilterParameterRootTracker {
    const pending = new Set<string>();
    const failed = new Set<string>();
    return {
        pending,
        failed,
        generation: 0,
        reset() {
            pending.clear();
            failed.clear();
            this.generation += 1;
        },
    };
}

/**
 * Loads the dependencies of the filter roots the map does not know yet. A root is requested at most once
 * between two initializations of the map: one in flight is skipped by the handlers that run meanwhile,
 * and one the graph rejected (a deleted or forbidden object, typically) is remembered by the tracker
 * rather than retried on every later write to the tabs slice. Only real results reach the map.
 *
 * @internal
 */
export function* registerFilterParameterDependencies(
    ctx: DashboardContext,
    tracker: IFilterParameterRootTracker,
): SagaIterator<void> {
    const status: ReturnType<typeof selectCatalogFilterParametersStatus> = yield select(
        selectCatalogFilterParametersStatus,
    );
    if (status !== "loaded") {
        return;
    }
    const filtersByTab: ReturnType<typeof selectFiltersByTab> = yield select(selectFiltersByTab);
    const known: ReturnType<typeof selectCatalogFilterParameters> = yield select(
        selectCatalogFilterParameters,
    );
    const unknownRoots = collectFilterParameterRoots(Object.values(filtersByTab).flat()).filter((root) => {
        const key = serializeObjRef(root);
        return !(key in known) && !tracker.pending.has(key) && !tracker.failed.has(key);
    });
    if (unknownRoots.length === 0) {
        return;
    }
    const keys = unknownRoots.map(serializeObjRef);
    const generation = tracker.generation;
    keys.forEach((key) => tracker.pending.add(key));
    try {
        const byRef: PromiseFnReturnType<typeof loadReachableParameterMap> = yield call(
            loadReachableParameterMap,
            ctx,
            unknownRoots,
        );
        if (tracker.generation === generation) {
            yield put(catalogActions.mergeCatalogFilterParameters(byRef));
        }
    } catch {
        if (tracker.generation === generation) {
            keys.forEach((key) => tracker.failed.add(key));
        }
    } finally {
        if (tracker.generation === generation) {
            keys.forEach((key) => tracker.pending.delete(key));
        }
    }
}

function writesTabs(action: Action): boolean {
    return unbatched(action).some((item) => item.type.startsWith(TABS_ACTION_PREFIX));
}
