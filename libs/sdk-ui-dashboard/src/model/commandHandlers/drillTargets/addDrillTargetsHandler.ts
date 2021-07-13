// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { AddDrillTargets } from "../../commands/drillTargets";
import { DrillTargetsAdded, drillTargetsAdded } from "../../events/drillTargets";
import { internalErrorOccurred } from "../../events/general";
import { drillTargetsActions } from "../../state/drillTargets";
import { DashboardContext } from "../../types/commonTypes";

export function* addDrillTargetsHandler(
    ctx: DashboardContext,
    cmd: AddDrillTargets,
): SagaIterator<DrillTargetsAdded> {
    // eslint-disable-next-line no-console
    console.debug("handling add drill targets", cmd, "in context", ctx);

    try {
        const { widgetRef, availableDrillTargets } = cmd.payload;

        yield put(drillTargetsActions.addDrillTargets({ ref: widgetRef, availableDrillTargets }));
        return drillTargetsAdded(ctx, widgetRef, availableDrillTargets, cmd.correlationId);
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while adding drill targets",
            e,
            cmd.correlationId,
        );
    }
}
