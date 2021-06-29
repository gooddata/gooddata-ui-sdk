// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { DrillDown } from "../../commands/drill";
import { drillDownTriggered } from "../../events/drill";
import { FullVisualizationCatalog } from "@gooddata/sdk-ui-ext/dist/internal";

export function* drillDownHandler(ctx: DashboardContext, cmd: DrillDown): SagaIterator<void> {
    // eslint-disable-next-line no-console
    console.debug("handling drill down", cmd, "in context", ctx);

    try {
        const { drillDefinition, drillEvent, insight } = cmd.payload;
        const insightWithDrillDownApplied = FullVisualizationCatalog.forInsight(insight).applyDrillDown(
            insight,
            { drillDefinition, event: drillEvent },
        );

        yield dispatchDashboardEvent(
            drillDownTriggered(
                ctx,
                insightWithDrillDownApplied,
                cmd.payload.drillDefinition,
                cmd.payload.drillEvent,
                cmd.correlationId,
            ),
        );
    } catch (e) {
        yield dispatchDashboardEvent(
            internalErrorOccurred(
                ctx,
                "An unexpected error has occurred while drilling down",
                e,
                cmd.correlationId,
            ),
        );
    }
}
