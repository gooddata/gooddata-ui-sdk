// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeDrillableItems } from "../../commands/drill.js";
import { DashboardDrillableItemsChanged, drillableItemsChanged } from "../../events/drill.js";
import { drillActions } from "../../store/drill/index.js";

export function* changeDrillableItemsHandler(
    ctx: DashboardContext,
    cmd: ChangeDrillableItems,
): SagaIterator<DashboardDrillableItemsChanged> {
    const { drillableItems } = cmd.payload;

    yield put(drillActions.setDrillableItems(drillableItems));

    return drillableItemsChanged(ctx, drillableItems, cmd.correlationId);
}
