// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import { DrillDown } from "../../commands/drill.js";
import { DashboardDrillDownResolved, drillDownRequested, drillDownResolved } from "../../events/drill.js";
import { getInsightWithAppliedDrillDown } from "@gooddata/sdk-ui-ext";
import { selectEnableDuplicatedLabelValuesInAttributeFilter } from "../../store/config/configSelectors.js";

export function* drillDownHandler(
    ctx: DashboardContext,
    cmd: DrillDown,
): SagaIterator<DashboardDrillDownResolved> {
    const { drillDefinition, drillEvent, insight } = cmd.payload;

    yield put(drillDownRequested(ctx, insight, drillDefinition, drillEvent, cmd.correlationId));

    const enableDuplicatedLabelValuesInAttributeFilter: ReturnType<
        typeof selectEnableDuplicatedLabelValuesInAttributeFilter
    > = yield select(selectEnableDuplicatedLabelValuesInAttributeFilter);

    const insightWithDrillDownApplied = getInsightWithAppliedDrillDown(
        insight,
        drillEvent,
        drillDefinition,
        ctx.backend.capabilities.supportsElementUris ?? true,
        enableDuplicatedLabelValuesInAttributeFilter,
    );

    return drillDownResolved(
        ctx,
        insightWithDrillDownApplied,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
