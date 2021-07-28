// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { AddDrillTargets } from "../../commands/drillTargets";
import { DrillTargetsAdded, drillTargetsAdded } from "../../events/drillTargets";
import { drillTargetsActions } from "../../state/drillTargets";
import { DashboardContext } from "../../types/commonTypes";
import { selectWidgetsMap } from "../../state/layout/layoutSelectors";
import { validateExistingInsightWidget } from "../widgets/validation/widgetValidations";

export function* addDrillTargetsHandler(
    ctx: DashboardContext,
    cmd: AddDrillTargets,
): SagaIterator<DrillTargetsAdded> {
    const {
        payload: { availableDrillTargets },
        correlationId,
    } = cmd;

    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const { ref, uri, identifier } = insightWidget;

    yield put(
        drillTargetsActions.addDrillTargets({
            identifier: identifier,
            uri: uri,
            ref,
            availableDrillTargets,
        }),
    );

    return drillTargetsAdded(ctx, ref, availableDrillTargets, correlationId);
}
