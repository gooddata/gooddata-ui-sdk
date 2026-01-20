// (C) 2025-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { type IRepositionDashboardTab } from "../../commands/tabs.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardTabRepositioned, dashboardTabRepositioned } from "../../events/tabs.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/**
 * @internal
 */
export function* repositionDashboardTabHandler(
    ctx: DashboardContext,
    cmd: IRepositionDashboardTab,
): SagaIterator<IDashboardTabRepositioned> {
    const { oldIndex, newIndex } = cmd.payload;

    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const activeTabLocalIdentifier: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );

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
            activeTabLocalIdentifier,
        }),
    );

    return dashboardTabRepositioned(ctx, oldIndex, newIndex, cmd.correlationId);
}

function isValidIndex(index: number, array: unknown[]) {
    return index >= 0 && index < array.length && Number.isInteger(index);
}
