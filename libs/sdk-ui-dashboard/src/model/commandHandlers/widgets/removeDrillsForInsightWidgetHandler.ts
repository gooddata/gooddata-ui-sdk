// (C) 2021 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { RemoveDrillsForInsightWidget } from "../../commands";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { DashboardInsightWidgetDrillsRemoved, insightWidgetDrillsRemoved } from "../../events/insight";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { validateRemoveDrillsByOrigins } from "./validation/removeDrillsSelectorValidation";
import { layoutActions } from "../../store/layout";
import { existsDrillDefinitionInArray } from "./validation/insightDrillDefinitionUtils";

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

    const drillToRemove = validateRemoveDrillsByOrigins(origins, currentInsightDrills, ctx, cmd);

    const notModifiedDrillDefinition = currentInsightDrills.filter(
        (drillItem) => !existsDrillDefinitionInArray(drillItem, drillToRemove),
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

    return insightWidgetDrillsRemoved(ctx, widgetRef, drillToRemove, correlationId);
}
