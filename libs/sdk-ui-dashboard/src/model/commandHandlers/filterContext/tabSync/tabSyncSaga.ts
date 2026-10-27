// (C) 2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";
import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { type IDashboardCommand } from "../../../commands/base.js";
import { selectCrossFilteringFiltersLocalIdentifiersByTab } from "../../../store/drill/drillSelectors.js";
import {
    selectEnablePersistentFiltersAcrossTabs,
    selectPersistedDashboardAttributeFilterConfigsByTab,
} from "../../../store/meta/metaSelectors.js";
import { selectActiveTabLocalIdentifier, selectTabsState } from "../../../store/tabs/tabsSelectors.js";
import { type ITabsState } from "../../../store/tabs/tabsState.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import {
    type IFilterContextByTabSnapshot,
    captureFilterContextByTabSnapshot,
    dispatchFilterContextChanged,
    dispatchFilterContextChangedForMutatedTabs,
} from "../common.js";

import { expandActionsForTabSync } from "./expandActionsForTabSync.js";
import { type ITabSyncScope } from "./tabSyncScope.js";

/**
 * State of tab sync for one command, from {@link beginTabSync} to {@link endTabSync}.
 *
 * @internal
 */
export interface ITabSyncSession {
    readonly scope: ITabSyncScope;
    /**
     * Filter contexts of every tab before the command, taken only when sync is enabled.
     */
    readonly snapshot: IFilterContextByTabSnapshot | undefined;
}

/**
 * @internal
 */
export interface IBeginTabSyncOptions {
    /**
     * Set to false to keep this command on its own tab even when filters persist across tabs.
     */
    readonly enabled?: boolean;
    /**
     * Tab the command is issued on. Defaults to the active tab.
     */
    readonly tabLocalIdentifier?: string;
}

/**
 * Starts tab sync for a command. Call before reading the state that the command changes.
 *
 * @internal
 */
export function* beginTabSync(options: IBeginTabSyncOptions = {}): SagaIterator<ITabSyncSession> {
    const enablePersistentFiltersAcrossTabs: ReturnType<typeof selectEnablePersistentFiltersAcrossTabs> =
        yield select(selectEnablePersistentFiltersAcrossTabs);
    const activeTabLocalIdentifier: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );
    const enabled = !!enablePersistentFiltersAcrossTabs && (options.enabled ?? true);
    const sourceTabLocalIdentifier = options.tabLocalIdentifier ?? activeTabLocalIdentifier;

    const crossFilteringLocalIdsByTab: ReturnType<typeof selectCrossFilteringFiltersLocalIdentifiersByTab> =
        enabled ? yield select(selectCrossFilteringFiltersLocalIdentifiersByTab) : {};
    const persistedAttributeFilterConfigsByTab: ReturnType<
        typeof selectPersistedDashboardAttributeFilterConfigsByTab
    > = enabled ? yield select(selectPersistedDashboardAttributeFilterConfigsByTab) : {};
    const snapshot: IFilterContextByTabSnapshot | undefined = enabled
        ? yield call(captureFilterContextByTabSnapshot)
        : undefined;

    return {
        scope: {
            enabled,
            sourceTabLocalIdentifier,
            crossFilteringLocalIdsByTab,
            persistedAttributeFilterConfigsByTab,
        },
        snapshot,
    };
}

/**
 * Dispatches `actions` together with their copies for the other tabs, as one batch.
 *
 * @returns every dispatched action, copies included
 * @internal
 */
export function* putTabSynced(session: ITabSyncSession, actions: readonly Action[]): SagaIterator<Action[]> {
    if (actions.length === 0) {
        return [];
    }
    const tabsState: ITabsState = yield select(selectTabsState);
    const expanded = expandActionsForTabSync(tabsState, actions, session.scope);
    yield put(expanded.length === 1 ? expanded[0] : batchActions(expanded));
    return expanded;
}

/**
 * Emits a filter context changed event for the source tab, also when the command changed nothing,
 * and when sync is enabled one more for every other tab the command changed.
 *
 * @internal
 */
export function* endTabSync(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    session: ITabSyncSession,
    tabLocalIdentifier?: string,
): SagaIterator<void> {
    yield call(dispatchFilterContextChanged, ctx, cmd, tabLocalIdentifier);
    if (session.snapshot) {
        yield call(
            dispatchFilterContextChangedForMutatedTabs,
            ctx,
            cmd,
            session.snapshot,
            session.scope.sourceTabLocalIdentifier,
        );
    }
}
