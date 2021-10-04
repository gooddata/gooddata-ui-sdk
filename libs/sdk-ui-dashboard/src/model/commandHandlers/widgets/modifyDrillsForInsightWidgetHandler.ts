// (C) 2021 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { ModifyDrillsForInsightWidget } from "../../commands";
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { DashboardInsightWidgetDrillsModified, insightWidgetDrillsModified } from "../../events/insight";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { getValidationData, validateDrillDefinition } from "./validation/insightDrillDefinitionValidation";
import { layoutActions } from "../../store/layout";
import { batchActions } from "redux-batched-actions";
import { insightsActions } from "../../store/insights";
import { existsDrillDefinitionInArray } from "./validation/insightDrillDefinitionUtils";

export function* modifyDrillsForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ModifyDrillsForInsightWidget,
): SagaIterator<DashboardInsightWidgetDrillsModified> {
    const {
        payload: { drills: drillsToModify = [] },
        correlationId,
    } = cmd;

    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const { ref: widgetRef } = insightWidget;

    const validationData: SagaReturnType<typeof getValidationData> = yield call(
        getValidationData,
        widgetRef,
        drillsToModify,
        ctx,
    );

    const { drills: currentInsightDrills = [] } = insightWidget;

    const validatedDrillDefinition = drillsToModify.map((drillItem) =>
        validateDrillDefinition(drillItem, validationData, ctx, cmd),
    );

    const addedDrillDefinition = validatedDrillDefinition.filter(
        (drillItem) => !existsDrillDefinitionInArray(drillItem, currentInsightDrills),
    );
    const updatedDrillDefinition = validatedDrillDefinition.filter((drillItem) =>
        existsDrillDefinitionInArray(drillItem, currentInsightDrills),
    );
    const notModifiedDrillDefinition = currentInsightDrills.filter(
        (drillItem) => !existsDrillDefinitionInArray(drillItem, drillsToModify),
    );

    const updatedInsightDrills = [
        ...addedDrillDefinition,
        ...updatedDrillDefinition,
        ...notModifiedDrillDefinition,
    ];

    yield put(
        batchActions([
            insightsActions.addInsights(validationData.resolvedInsights.loaded),
            layoutActions.replaceWidgetDrills({
                ref: insightWidget.ref,
                drillDefinitions: updatedInsightDrills,
                undo: {
                    cmd,
                },
            }),
        ]),
    );

    return insightWidgetDrillsModified(
        ctx,
        widgetRef,
        addedDrillDefinition,
        updatedDrillDefinition,
        correlationId,
    );
}
