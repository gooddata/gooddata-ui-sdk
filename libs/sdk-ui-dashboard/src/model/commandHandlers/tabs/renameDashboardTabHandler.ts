// (C) 2025-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { type IRenameDashboardTab } from "../../commands/tabs.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardTabRenamed, dashboardTabRenamed } from "../../events/tabs.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/**
 * @internal
 */
export function* renameDashboardTabHandler(
    ctx: DashboardContext,
    cmd: IRenameDashboardTab,
): SagaIterator<IDashboardTabRenamed> {
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const activeTabLocalIdentifier: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );

    if (!tabs || tabs.length === 0) {
        throw invalidArgumentsProvided(ctx, cmd, "Attempting to rename a tab when there are no tabs.");
    }

    const targetTabLocalIdentifier = cmd.payload.tabId ?? activeTabLocalIdentifier;
    if (!targetTabLocalIdentifier) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            "Attempting to rename a tab without specifying a tab and no active tab is set.",
        );
    }

    const exists = tabs.some((t) => t.localIdentifier === targetTabLocalIdentifier);
    if (!exists) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to rename non-existent tab with local identifier ${targetTabLocalIdentifier}. There are ${tabs.length} tabs.`,
        );
    }

    const { title } = cmd.payload;

    yield put(tabsActions.renameTab({ tabId: targetTabLocalIdentifier, title }));
    yield put(tabsActions.setTabIsRenaming({ tabId: targetTabLocalIdentifier, isRenaming: false }));

    return dashboardTabRenamed(ctx, targetTabLocalIdentifier, title, cmd.correlationId);
}
