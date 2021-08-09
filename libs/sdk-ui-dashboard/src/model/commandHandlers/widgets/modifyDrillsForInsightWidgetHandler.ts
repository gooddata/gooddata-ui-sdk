// (C) 2021 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { ModifyDrillsForInsightWidget } from "../../commands";
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";

import { DashboardInsightWidgetDrillsModified, insightWidgetDrillsModified } from "../../events/insight";
import { selectWidgetsMap } from "../../state/layout/layoutSelectors";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { selectDrillTargetsByWidgetRef } from "../../state/drillTargets/drillTargetsSelectors";
import {
    existsDrillDefinitionInArray,
    extractInsightRefs,
} from "../../../_staging/drills/InsightDrillDefinitionUtils";
import { validateDrillDefinition } from "./validation/insightDrillDefinitionValidation";
import { layoutActions } from "../../state/layout";
import { selectListedDashboardsMap } from "../../state/listedDashboards/listedDashboardsSelectors";
import { resolveInsights } from "../../utils/insightResolver";
import { batchActions } from "redux-batched-actions";
import { insightsActions } from "../../state/insights";

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

    const listedDashboardMap: ReturnType<typeof selectListedDashboardsMap> = yield select(
        selectListedDashboardsMap,
    );

    const insightRefs = extractInsightRefs(drillsToModify);
    const resolvedInsights: SagaReturnType<typeof resolveInsights> = yield call(
        resolveInsights,
        ctx,
        insightRefs,
    );

    const { drills: currentInsightDrills = [] } = insightWidget;

    const validatedDrillDefinition = drillsToModify.map((drillItem) =>
        validateDrillDefinition(
            drillItem,
            drillTargets,
            listedDashboardMap,
            resolvedInsights.resolved,
            ctx,
            cmd,
        ),
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
            insightsActions.addInsights(resolvedInsights.loaded),
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
