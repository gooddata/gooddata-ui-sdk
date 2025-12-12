// (C) 2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { type CancelRenamingDashboardTab } from "../../commands/tabs.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type DashboardTabRenamingCanceled, dashboardTabRenamingCanceled } from "../../events/tabs.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/**
 * @internal
 */
export function* cancelRenamingDashboardTabHandler(
    ctx: DashboardContext,
    cmd: CancelRenamingDashboardTab,
): SagaIterator<DashboardTabRenamingCanceled> {
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const activeTabLocalIdentifier: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );

    if (!tabs || tabs.length === 0) {
        throw invalidArgumentsProvided(ctx, cmd, "Attempting to cancel renaming when there are no tabs.");
    }

    const targetTabLocalIdentifier = cmd.payload.tabId ?? activeTabLocalIdentifier;
    if (!targetTabLocalIdentifier) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            "Attempting to cancel renaming without specifying a tab and no active tab is set.",
        );
    }

    const exists = tabs.some((t) => t.localIdentifier === targetTabLocalIdentifier);
    if (!exists) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to cancel renaming non-existent tab with local identifier ${targetTabLocalIdentifier}. There are ${tabs.length} tabs.`,
        );
    }

    yield put(tabsActions.setTabIsRenaming({ tabId: targetTabLocalIdentifier, isRenaming: false }));

    return dashboardTabRenamingCanceled(ctx, targetTabLocalIdentifier, cmd.correlationId);
}
