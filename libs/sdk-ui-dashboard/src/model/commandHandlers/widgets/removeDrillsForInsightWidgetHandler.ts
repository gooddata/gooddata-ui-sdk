// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { existsDrillDefinitionInArray } from "./validation/insightDrillDefinitionUtils.js";
import { validateRemoveDrillsByLocalIdentifier } from "./validation/removeDrillsSelectorValidation.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type RemoveDrillsForInsightWidget } from "../../commands/index.js";
import {
    type DashboardInsightWidgetDrillsRemoved,
    insightWidgetDrillsRemoved,
} from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetByRef, selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { validateDrills } from "../common/validateDrills.js";
import { validateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams.js";

export function* removeDrillsForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: RemoveDrillsForInsightWidget,
): SagaIterator<DashboardInsightWidgetDrillsRemoved> {
    const {
        payload: { localIdentifiers },
        correlationId,
    } = cmd;

    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const { ref: widgetRef, drills: currentInsightDrills } = insightWidget;

    const drillsToRemove = validateRemoveDrillsByLocalIdentifier(
        localIdentifiers,
        currentInsightDrills,
        ctx,
        cmd,
    );

    const notModifiedDrillDefinition = currentInsightDrills.filter(
        (drillItem) => !existsDrillDefinitionInArray(drillItem, drillsToRemove),
    );

    yield put(
        tabsActions.replaceWidgetDrills({
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
