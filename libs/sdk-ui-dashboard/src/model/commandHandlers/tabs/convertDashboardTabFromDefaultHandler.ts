// (C) 2025-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { v4 as uuid } from "uuid";

import { switchDashboardTabHandler } from "./switchDashboardTabHandler.js";
import { type IConvertDashboardTabFromDefault, switchDashboardTab } from "../../commands/tabs.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardTabSwitched, dashboardTabConvertedFromDefault } from "../../events/tabs.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { DEFAULT_TAB_ID } from "../../store/tabs/tabsState.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* convertDashboardTabFromDefaultHandler(
    ctx: DashboardContext,
    cmd: IConvertDashboardTabFromDefault,
): SagaIterator<void> {
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const activeTabLocalIdentifier: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );

    if (!tabs || tabs.length === 0) {
        throw invalidArgumentsProvided(ctx, cmd, "Attempting to convert default tab when there are no tabs.");
    }

    const defaultIndex = tabs.findIndex((t) => t.localIdentifier === DEFAULT_TAB_ID);
    if (defaultIndex < 0) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to convert non-existent default tab with local identifier ${DEFAULT_TAB_ID}.`,
        );
    }

    const newTabId = uuid();

    const defaultTab = tabs[defaultIndex];
    const updatedTab = {
        ...defaultTab,
        localIdentifier: newTabId,
        title: cmd.payload.title ?? defaultTab.title,
    };

    const updatedTabs = tabs.slice();
    updatedTabs[defaultIndex] = updatedTab;

    yield put(
        tabsActions.setTabs({
            tabs: updatedTabs,
            activeTabLocalIdentifier,
        }),
    );

    yield dispatchDashboardEvent(
        dashboardTabConvertedFromDefault(ctx, newTabId, defaultIndex, cmd.correlationId),
    );

    if (activeTabLocalIdentifier === DEFAULT_TAB_ID) {
        const switchedEvent: IDashboardTabSwitched = yield call(
            switchDashboardTabHandler,
            ctx,
            switchDashboardTab(newTabId, cmd.correlationId),
        );
        yield dispatchDashboardEvent(switchedEvent);
    }
}
