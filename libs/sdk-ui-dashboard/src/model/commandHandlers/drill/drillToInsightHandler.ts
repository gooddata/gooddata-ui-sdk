// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { addDrillFiltersToInsight } from "./drillToInsightUtils.js";
import { type IDrillToInsight } from "../../commands/drill.js";
import {
    type IDashboardDrillToInsightResolved,
    drillToInsightRequested,
    drillToInsightResolved,
} from "../../events/drill.js";
import { selectInsightByRef, selectInsightByWidgetRef } from "../../store/insights/insightsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* drillToInsightHandler(
    ctx: DashboardContext,
    cmd: IDrillToInsight,
): SagaIterator<IDashboardDrillToInsightResolved> {
    const { drillDefinition, drillEvent } = cmd.payload;
    const insight = yield select(selectInsightByRef(drillDefinition.target));
    yield put(drillToInsightRequested(ctx, insight, drillDefinition, drillEvent, cmd.correlationId));

    const sourceInsight = drillEvent.widgetRef
        ? yield select(selectInsightByWidgetRef(drillEvent.widgetRef))
        : null;
    const insightWithFiltersApplied = addDrillFiltersToInsight(
        insight,
        sourceInsight,
        drillDefinition,
        drillEvent,
        ctx.backend.capabilities.supportsElementUris ?? true,
    );

    return drillToInsightResolved(
        ctx,
        insightWithFiltersApplied,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
