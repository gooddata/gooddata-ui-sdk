// (C) 2025 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { SwitchDashboardTab } from "../../commands/tabs.js";
import { DashboardTabSwitched, dashboardTabSwitched } from "../../events/tabs.js";
import { layoutActions } from "../../store/layout/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabId, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

/**
 * @internal
 */
export function* switchDashboardTabHandler(
    ctx: DashboardContext,
    cmd: SwitchDashboardTab,
): SagaIterator<DashboardTabSwitched> {
    const { tabId } = cmd.payload;

    const currentActiveTabId: ReturnType<typeof selectActiveTabId> = yield select(selectActiveTabId);
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);

    const newTab = tabs?.find((t) => t.identifier === tabId);

    if (!newTab) {
        throw new Error(`Tab with id "${tabId}" not found`);
    }

    const actions = [];

    actions.push(tabsActions.setActiveTabId(newTab.identifier));
    actions.push(layoutActions.clearLayoutHistory());

    yield put(batchActions(actions));

    return dashboardTabSwitched(ctx, currentActiveTabId, tabId, cmd.correlationId);
}
