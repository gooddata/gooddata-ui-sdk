// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { AddDrillTargets } from "../../commands/drillTargets";
import { DrillTargetsAdded, drillTargetsAdded } from "../../events/drillTargets";
import { invalidArgumentsProvided } from "../../events/general";
import { drillTargetsActions } from "../../state/drillTargets";
import { DashboardContext } from "../../types/commonTypes";
import { selectWidgetsMap } from "../../state/layout/layoutSelectors";
import { objRefToString } from "@gooddata/sdk-model";

export function* addDrillTargetsHandler(
    ctx: DashboardContext,
    cmd: AddDrillTargets,
): SagaIterator<DrillTargetsAdded> {
    const {
        payload: { widgetRef, availableDrillTargets },
        correlationId,
    } = cmd;
    const existingWidgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const widget = existingWidgets.get(widgetRef);

    if (!widget) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to register drill targets for non-existing widget with ref ${objRefToString(
                widgetRef,
            )}. The drill targets will be ignored.`,
            correlationId,
        );
    }

    yield put(
        drillTargetsActions.addDrillTargets({
            identifier: widget.identifier,
            uri: widget.uri,
            ref: widgetRef,
            availableDrillTargets,
        }),
    );

    return drillTargetsAdded(ctx, widgetRef, availableDrillTargets, correlationId);
}
