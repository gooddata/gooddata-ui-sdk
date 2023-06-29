// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { RemoveDrillsForInsightWidget } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { DashboardInsightWidgetDrillsRemoved, insightWidgetDrillsRemoved } from "../../events/insight.js";
import { selectWidgetByRef, selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { validateRemoveDrillsByOrigins } from "./validation/removeDrillsSelectorValidation.js";
import { layoutActions } from "../../store/layout/index.js";
import { existsDrillDefinitionInArray } from "./validation/insightDrillDefinitionUtils.js";
import { validateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams.js";
import { validateDrills } from "../common/validateDrills.js";

export function* removeDrillsForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: RemoveDrillsForInsightWidget,
): SagaIterator<DashboardInsightWidgetDrillsRemoved> {
    const {
        payload: { origins },
        correlationId,
    } = cmd;

    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const { ref: widgetRef, drills: currentInsightDrills } = insightWidget;

    const drillsToRemove = validateRemoveDrillsByOrigins(origins, currentInsightDrills, ctx, cmd);

    const notModifiedDrillDefinition = currentInsightDrills.filter(
        (drillItem) => !existsDrillDefinitionInArray(drillItem, drillsToRemove),
    );

    yield put(
        layoutActions.replaceWidgetDrills({
            ref: widgetRef,
            drillDefinitions: notModifiedDrillDefinition,
            undo: {
                cmd,
            },
        }),
    );

    // need to select the update widget to validate it by its new value
    const updatedWidget = yield select(selectWidgetByRef(widgetRef));
    yield call(validateDrills, ctx, cmd, [updatedWidget]);
    yield call(validateDrillToCustomUrlParams, [updatedWidget]);

    return insightWidgetDrillsRemoved(ctx, widgetRef, drillsToRemove, correlationId);
}
