// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { type IChangeDrillableItems } from "../../commands/drill.js";
import { type IDashboardDrillableItemsChanged, drillableItemsChanged } from "../../events/drill.js";
import { drillActions } from "../../store/drill/index.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeDrillableItemsHandler(
    ctx: DashboardContext,
    cmd: IChangeDrillableItems,
): SagaIterator<IDashboardDrillableItemsChanged> {
    const { drillableItems } = cmd.payload;

    const activeTabId: ReturnType<typeof selectActiveOrDefaultTabLocalIdentifier> = yield select(
        selectActiveOrDefaultTabLocalIdentifier,
    );

    yield put(drillActions.setDrillableItems({ items: drillableItems, tabId: activeTabId }));

    return drillableItemsChanged(ctx, drillableItems, cmd.correlationId);
}
