// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { DrillToInsight } from "../../commands/drill";
import {
    DashboardDrillToInsightResolved,
    drillToInsightRequested,
    drillToInsightResolved,
} from "../../events/drill";
import { selectInsightByRef } from "../../store/insights/insightsSelectors";
import { addIntersectionFiltersToInsight } from "@gooddata/sdk-ui-ext/dist/internal/components/pluggableVisualizations/drillDownUtil";

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
    );

    return drillToInsightResolved(
        ctx,
        insightWithDrillsApplied,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
