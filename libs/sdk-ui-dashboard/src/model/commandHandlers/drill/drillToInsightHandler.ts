// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { select } from "redux-saga/effects";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { DrillToInsight } from "../../commands/drill";
import { drillToInsightTriggered } from "../../events/drill";
import { selectInsightByRef } from "../../state/insights/insightsSelectors";
import { addIntersectionFiltersToInsight } from "@gooddata/sdk-ui-ext/dist/internal/components/pluggableVisualizations/drillDownUtil";

export function* drillToInsightHandler(ctx: DashboardContext, cmd: DrillToInsight): SagaIterator<void> {
    // eslint-disable-next-line no-console
    console.debug("handling drill to insight", cmd, "in context", ctx);

    try {
        const { drillDefinition, drillEvent } = cmd.payload;

        const insight = yield select(selectInsightByRef(drillDefinition.target));

        const insightWithDrillsApplied = addIntersectionFiltersToInsight(
            insight,
            drillEvent.drillContext.intersection!,
        );

        yield dispatchDashboardEvent(
            drillToInsightTriggered(
                ctx,
                insightWithDrillsApplied,
                cmd.payload.drillDefinition,
                cmd.payload.drillEvent,
                cmd.correlationId,
            ),
        );
    } catch (e) {
        yield dispatchDashboardEvent(
            internalErrorOccurred(
                ctx,
                "An unexpected error has occurred while drilling to insight",
                e,
                cmd.correlationId,
            ),
        );
    }
}
