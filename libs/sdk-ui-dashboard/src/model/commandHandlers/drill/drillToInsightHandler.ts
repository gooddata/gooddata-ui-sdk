// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import { DrillToInsight } from "../../commands/drill.js";
import {
    DashboardDrillToInsightResolved,
    drillToInsightRequested,
    drillToInsightResolved,
} from "../../events/drill.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { addIntersectionFiltersToInsight } from "@gooddata/sdk-ui-ext";

export function* drillToInsightHandler(
    ctx: DashboardContext,
    cmd: DrillToInsight,
): SagaIterator<DashboardDrillToInsightResolved> {
    const { drillDefinition, drillEvent } = cmd.payload;
    const insight = yield select(selectInsightByRef(drillDefinition.target));
    yield put(drillToInsightRequested(ctx, insight, drillDefinition, drillEvent, cmd.correlationId));

    const insightWithDrillsApplied = addIntersectionFiltersToInsight(
        insight,
        drillEvent.drillContext.intersection!,
        ctx.backend.capabilities.supportsElementUris ?? true,
    );

    return drillToInsightResolved(
        ctx,
        insightWithDrillsApplied,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
