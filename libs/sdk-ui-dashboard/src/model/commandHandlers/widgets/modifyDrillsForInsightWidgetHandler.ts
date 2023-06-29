// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { ModifyDrillsForInsightWidget } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { DashboardInsightWidgetDrillsModified, insightWidgetDrillsModified } from "../../events/insight.js";
import { selectWidgetByRef, selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { getValidationData, validateDrillDefinition } from "./validation/insightDrillDefinitionValidation.js";
import { layoutActions } from "../../store/layout/index.js";
import { batchActions } from "redux-batched-actions";
import { insightsActions } from "../../store/insights/index.js";
import {
    existsDrillDefinitionInArray,
    getDrillDefinitionFromArray,
} from "./validation/insightDrillDefinitionUtils.js";
import { validateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams.js";
import { validateDrills } from "../common/validateDrills.js";

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
    // we need keep order of currentInsightDrills
    const drills = currentInsightDrills.map((drillItem) => {
        const updated = getDrillDefinitionFromArray(drillItem, updatedDrillDefinition);
        if (updated) {
            return updated;
        }

        return drillItem;
    });

    const updatedInsightDrills = [...drills, ...addedDrillDefinition];

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

    // need to select the update widget to validate it by its new value
    const updatedWidget = yield select(selectWidgetByRef(insightWidget.ref));
    yield call(validateDrills, ctx, cmd, [updatedWidget]);
    yield call(validateDrillToCustomUrlParams, [updatedWidget]);

    return insightWidgetDrillsModified(
        ctx,
        widgetRef,
        addedDrillDefinition,
        updatedDrillDefinition,
        correlationId,
    );
}
