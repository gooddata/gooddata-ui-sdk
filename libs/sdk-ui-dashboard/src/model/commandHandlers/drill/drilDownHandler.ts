// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { DrillDown } from "../../commands/drill";
import { DashboardDrillDownTriggered, drillDownTriggered } from "../../events/drill";
import { FullVisualizationCatalog } from "@gooddata/sdk-ui-ext/dist/internal";

export function drillDownHandler(ctx: DashboardContext, cmd: DrillDown): DashboardDrillDownTriggered {
    // eslint-disable-next-line no-console
    console.debug("handling drill down", cmd, "in context", ctx);

    try {
        const { drillDefinition, drillEvent, insight } = cmd.payload;
        const insightWithDrillDownApplied = FullVisualizationCatalog.forInsight(insight).applyDrillDown(
            insight,
            { drillDefinition, event: drillEvent },
        );

        return drillDownTriggered(
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
