// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { DrillDown } from "../../commands/drill";
import { DashboardDrillDownResolved, drillDownResolved, drillDownRequested } from "../../events/drill";
import { FullVisualizationCatalog } from "@gooddata/sdk-ui-ext/dist/internal";

export function* drillDownHandler(
    ctx: DashboardContext,
    cmd: DrillDown,
): SagaIterator<DashboardDrillDownResolved> {
    // eslint-disable-next-line no-console
    console.debug("handling drill down", cmd, "in context", ctx);
    try {
        const { drillDefinition, drillEvent, insight } = cmd.payload;

        yield put(drillDownRequested(ctx, insight, drillDefinition, drillEvent, cmd.correlationId));

        const insightWithDrillDownApplied = FullVisualizationCatalog.forInsight(insight).applyDrillDown(
            insight,
            { drillDefinition, event: drillEvent },
        );

        return drillDownResolved(
            ctx,
            insightWithDrillDownApplied,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent,
            cmd.correlationId,
        );
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while drilling down",
            e,
            cmd.correlationId,
        );
    }
}
