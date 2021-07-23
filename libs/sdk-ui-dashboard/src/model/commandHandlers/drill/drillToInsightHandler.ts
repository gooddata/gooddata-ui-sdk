// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { select, put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { DrillToInsight } from "../../commands/drill";
import {
    DashboardDrillToInsightResolved,
    drillToInsightResolved,
    drillToInsightRequested,
} from "../../events/drill";
import { selectInsightByRef } from "../../state/insights/insightsSelectors";
import { addIntersectionFiltersToInsight } from "@gooddata/sdk-ui-ext/dist/internal/components/pluggableVisualizations/drillDownUtil";

export function* drillToInsightHandler(
    ctx: DashboardContext,
    cmd: DrillToInsight,
): SagaIterator<DashboardDrillToInsightResolved> {
    // eslint-disable-next-line no-console
    console.debug("handling drill to insight", cmd, "in context", ctx);

    try {
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
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while drilling to insight",
            e,
            cmd.correlationId,
        );
    }
}
