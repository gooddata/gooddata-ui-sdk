// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { ChangeDrillableItems } from "../../commands/drill.js";
import { DashboardDrillableItemsChanged, drillableItemsChanged } from "../../events/drill.js";
import { drillActions } from "../../store/drill/index.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* changeDrillableItemsHandler(
    ctx: DashboardContext,
    cmd: ChangeDrillableItems,
): SagaIterator<DashboardDrillableItemsChanged> {
    const { drillableItems } = cmd.payload;

    const activeTabId: ReturnType<typeof selectActiveOrDefaultTabLocalIdentifier> = yield select(
        selectActiveOrDefaultTabLocalIdentifier,
    );

    yield put(drillActions.setDrillableItems({ items: drillableItems, tabId: activeTabId }));

    return drillableItemsChanged(ctx, drillableItems, cmd.correlationId);
}
