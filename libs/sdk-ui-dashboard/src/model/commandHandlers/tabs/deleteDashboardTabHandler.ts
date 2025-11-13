// (C) 2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { switchDashboardTabHandler } from "./switchDashboardTabHandler.js";
import { DeleteDashboardTab, switchDashboardTab } from "../../commands/tabs.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { DashboardTabDeleted, DashboardTabSwitched, dashboardTabDeleted } from "../../events/tabs.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabId, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

/**
 * @internal
 */
export function* deleteDashboardTabHandler(
    ctx: DashboardContext,
    cmd: DeleteDashboardTab,
): SagaIterator<DashboardTabDeleted> {
    const { tabId } = cmd.payload;

    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const activeTabId: ReturnType<typeof selectActiveTabId> = yield select(selectActiveTabId);

    if (!tabs || tabs.length === 0) {
        throw invalidArgumentsProvided(ctx, cmd, "Attempting to delete tab when there are no tabs.");
    }

    const index = tabs.findIndex((t) => t.identifier === tabId);
    if (index < 0) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to delete non-existent tab with id ${tabId}. There are ${tabs.length} tabs.`,
        );
    }

    const isActive = activeTabId === tabId;
    let nextActiveTabId: string | undefined = undefined;

    if (isActive) {
        // Prefer tab at the same index after deletion, then previous index
        const hasNextAtSameIndex = index + 1 < tabs.length; // there is an item after current index
        if (hasNextAtSameIndex) {
            nextActiveTabId = tabs[index + 1].identifier;
        } else if (index - 1 >= 0) {
            nextActiveTabId = tabs[index - 1].identifier;
        } else {
            nextActiveTabId = undefined;
        }

        if (nextActiveTabId) {
            // Switch to the next tab first so the current active tab state is saved back
            const switchedEvent: DashboardTabSwitched = yield call(
                switchDashboardTabHandler,
                ctx,
                switchDashboardTab(nextActiveTabId, cmd.correlationId),
            );
            // Ensure app-level sagas receive the switched event for URL sync etc.
            yield dispatchDashboardEvent(switchedEvent);
        } else {
            // No next active -> clear active tab id explicitly
            yield put(tabsActions.setActiveTabId(undefined));
        }
    }

    // Remove the tab
    yield put(tabsActions.removeTabById(tabId));

    // Emit deleted event
    return dashboardTabDeleted(ctx, tabId, index, nextActiveTabId, cmd.correlationId);
}
