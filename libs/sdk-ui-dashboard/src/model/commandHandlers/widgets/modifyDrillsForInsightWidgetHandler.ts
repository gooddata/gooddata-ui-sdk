// (C) 2021 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { ModifyDrillsForInsightWidget } from "../../commands";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { DashboardInsightWidgetDrillsModified, insightWidgetDrillsModified } from "../../events/insight";
import { selectWidgetsMap } from "../../state/layout/layoutSelectors";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { selectDrillTargetsByWidgetRef } from "../../state/drillTargets/drillTargetsSelectors";
import { existsDrillDefinitionInArray } from "../../../_staging/drills/InsightDrillDefinitionUtils";
import { validateInsightDrillDefinition } from "./validation/insightDrillDefinitionValidation";
import { layoutActions } from "../../state/layout";

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

    const selectDrillTargetsByWidgetRefSelector = selectDrillTargetsByWidgetRef(insightWidget.ref);

    const drillTargets: ReturnType<typeof selectDrillTargetsByWidgetRefSelector> = yield select(
        selectDrillTargetsByWidgetRefSelector,
    );

    const { drills: currentInsightDrills = [] } = insightWidget;

    const validatedDrillDefinition = drillsToModify.map((drillItem) =>
        validateInsightDrillDefinition(drillItem, drillTargets, ctx, cmd),
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
        layoutActions.replaceWidgetDrills({
            ref: insightWidget.ref,
            drillDefinitions: updatedInsightDrills,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetDrillsModified(
        ctx,
        widgetRef,
        addedDrillDefinition,
        updatedDrillDefinition,
        correlationId,
    );
}
