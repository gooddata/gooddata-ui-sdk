// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { ChangeDrillableItems } from "../../commands/drill";
import { DashboardDrillableItemsChanged, drillableItemsChanged } from "../../events/drill";
import { drillActions } from "../../store/drill";

export function* changeDrillableItemsHandler(
    ctx: DashboardContext,
    cmd: ChangeDrillableItems,
): SagaIterator<DashboardDrillableItemsChanged> {
    const { drillableItems } = cmd.payload;

    yield put(drillActions.setDrillableItems(drillableItems));

    return drillableItemsChanged(ctx, drillableItems, cmd.correlationId);
}
