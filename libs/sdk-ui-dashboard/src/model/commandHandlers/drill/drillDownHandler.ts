// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import { DrillDown } from "../../commands/drill.js";
import { DashboardDrillDownResolved, drillDownRequested, drillDownResolved } from "../../events/drill.js";
import { getInsightWithAppliedDrillDown } from "@gooddata/sdk-ui-ext";

export function* drillDownHandler(
    ctx: DashboardContext,
    cmd: DrillDown,
): SagaIterator<DashboardDrillDownResolved> {
    const { drillDefinition, drillEvent, insight } = cmd.payload;

    yield put(drillDownRequested(ctx, insight, drillDefinition, drillEvent, cmd.correlationId));

    const insightWithDrillDownApplied = getInsightWithAppliedDrillDown(
        insight,
        drillEvent,
        drillDefinition,
        ctx.backend.capabilities.supportsElementUris ?? true,
    );

    return drillDownResolved(
        ctx,
        insightWithDrillDownApplied,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
