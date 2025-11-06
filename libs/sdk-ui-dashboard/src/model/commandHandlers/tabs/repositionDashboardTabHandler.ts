// (C) 2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { RepositionDashboardTab } from "../../commands/tabs.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { DashboardTabRepositioned, dashboardTabRepositioned } from "../../events/tabs.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabId, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

/**
 * @internal
 */
export function* repositionDashboardTabHandler(
    ctx: DashboardContext,
    cmd: RepositionDashboardTab,
): SagaIterator<DashboardTabRepositioned> {
    const { oldIndex, newIndex } = cmd.payload;

    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const activeTabId: ReturnType<typeof selectActiveTabId> = yield select(selectActiveTabId);

    if (!tabs || tabs.length === 0) {
        throw invalidArgumentsProvided(ctx, cmd, "Attempting to reposition tab when there are no tabs.");
    }

    if (!isValidIndex(oldIndex, tabs)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to reposition non-existent tab from index ${oldIndex}. There are ${tabs.length} tabs.`,
        );
    }

    if (!isValidIndex(newIndex, tabs)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to reposition tab to invalid index ${newIndex}. There are ${tabs.length} tabs.`,
        );
    }

    const updatedTabs = tabs.slice();
    const [moved] = updatedTabs.splice(oldIndex, 1);
    // Insert at newIndex directly so the final position matches the requested index
    updatedTabs.splice(newIndex, 0, moved);

    // Persist reordered tabs and keep currently active tab as-is
    yield put(
        tabsActions.setTabs({
            tabs: updatedTabs,
            activeTabId,
        }),
    );

    return dashboardTabRepositioned(ctx, oldIndex, newIndex, cmd.correlationId);
}

function isValidIndex(index: number, array: unknown[]) {
    return index >= 0 && index < array.length && Number.isInteger(index);
}
