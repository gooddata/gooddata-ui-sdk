// (C) 2025-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { switchDashboardTabHandler } from "./switchDashboardTabHandler.js";
import { type IStartRenamingDashboardTab, switchDashboardTab } from "../../commands/tabs.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardTabRenamingStarted, dashboardTabRenamingStarted } from "../../events/tabs.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/**
 * @internal
 */
export function* startRenamingDashboardTabHandler(
    ctx: DashboardContext,
    cmd: IStartRenamingDashboardTab,
): SagaIterator<IDashboardTabRenamingStarted> {
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const activeTabLocalIdentifier: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );

    const { tabId = activeTabLocalIdentifier, shouldSelectTab = true } = cmd.payload;

    if (!tabs || tabs.length === 0) {
        throw invalidArgumentsProvided(ctx, cmd, "Attempting to start renaming when there are no tabs.");
    }

    if (!tabId) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            "Attempting to start renaming without specifying a tab and no active tab is set.",
        );
    }

    const exists = tabs.some((t) => t.localIdentifier === tabId);
    if (!exists) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to start renaming non-existent tab with local identifier ${tabId}. There are ${tabs.length} tabs.`,
        );
    }

    // Auto-select the tab unless explicitly disabled
    if (shouldSelectTab && activeTabLocalIdentifier !== tabId) {
        const switchedEvent = yield call(
            switchDashboardTabHandler,
            ctx,
            switchDashboardTab(tabId, cmd.correlationId),
        );
        // Important: explicitly dispatch the switched event so app-level sagas can sync URL
        yield dispatchDashboardEvent(switchedEvent);
    }

    yield put(tabsActions.setTabIsRenaming({ tabId, isRenaming: true }));

    return dashboardTabRenamingStarted(ctx, tabId, cmd.correlationId);
}
