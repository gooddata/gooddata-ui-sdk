// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { AddDrillTargets } from "../../commands/drillTargets.js";
import { DrillTargetsAdded, drillTargetsAdded } from "../../events/drillTargets.js";
import { drillTargetsActions } from "../../store/drillTargets/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingInsightWidget } from "../widgets/validation/widgetValidations.js";
import { selectEnableKPIDashboardDrillFromAttribute } from "../../store/config/configSelectors.js";
import { availableDrillTargetsValidation } from "./validation/availableDrillTargetsValidation.js";
import { validateDrills } from "../common/validateDrills.js";
import { selectIsInEditMode } from "../../store/renderMode/renderModeSelectors.js";
import { validateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams.js";

export function* addDrillTargetsHandler(
    ctx: DashboardContext,
    cmd: AddDrillTargets,
): SagaIterator<DrillTargetsAdded> {
    const {
        payload: { availableDrillTargets },
        correlationId,
    } = cmd;

    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const enableKPIDashboardDrillFromAttribute: boolean = yield select(
        selectEnableKPIDashboardDrillFromAttribute,
    );

    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const drillTarget = availableDrillTargetsValidation(
        availableDrillTargets,
        enableKPIDashboardDrillFromAttribute,
        ctx,
        cmd,
    );

    const { ref, uri, identifier } = insightWidget;

    yield put(
        drillTargetsActions.addDrillTargets({
            identifier,
            uri,
            ref,
            availableDrillTargets: drillTarget,
        }),
    );

    // in edit mode, we need to remove invalid drills in case the insight in the widget changes its drill targets
    // and also validate drill to custom URL parameters
    const isInEditMode: ReturnType<typeof selectIsInEditMode> = yield select(selectIsInEditMode);
    if (isInEditMode) {
        yield call(validateDrills, ctx, cmd, [insightWidget]);
        yield call(validateDrillToCustomUrlParams, [insightWidget]);
    }

    return drillTargetsAdded(ctx, ref, availableDrillTargets, correlationId);
}
