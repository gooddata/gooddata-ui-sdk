// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { addIntersectionFiltersToInsight } from "@gooddata/sdk-ui-ext";

import { removeIgnoredValuesFromDrillIntersection } from "./common/intersectionUtils.js";
import { type DrillToInsight } from "../../commands/drill.js";
import {
    type DashboardDrillToInsightResolved,
    drillToInsightRequested,
    drillToInsightResolved,
} from "../../events/drill.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* drillToInsightHandler(
    ctx: DashboardContext,
    cmd: DrillToInsight,
): SagaIterator<DashboardDrillToInsightResolved> {
    const { drillDefinition, drillEvent } = cmd.payload;
    const insight = yield select(selectInsightByRef(drillDefinition.target));
    yield put(drillToInsightRequested(ctx, insight, drillDefinition, drillEvent, cmd.correlationId));

    const filteredIntersection = cmd.payload.drillDefinition.drillIntersectionIgnoredAttributes
        ? removeIgnoredValuesFromDrillIntersection(
              cmd.payload.drillEvent.drillContext.intersection ?? [],
              cmd.payload.drillDefinition.drillIntersectionIgnoredAttributes ?? [],
          )
        : cmd.payload.drillEvent.drillContext.intersection!;

    const insightWithDrillsApplied = addIntersectionFiltersToInsight(
        insight,
        filteredIntersection!,
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
