// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { addIntersectionFiltersToInsight } from "@gooddata/sdk-ui-ext";

import { removeIgnoredValuesFromDrillIntersection } from "./common/intersectionUtils.js";
import { DrillToInsight } from "../../commands/drill.js";
import {
    DashboardDrillToInsightResolved,
    drillToInsightRequested,
    drillToInsightResolved,
} from "../../events/drill.js";
import { selectEnableDuplicatedLabelValuesInAttributeFilter } from "../../store/config/configSelectors.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* drillToInsightHandler(
    ctx: DashboardContext,
    cmd: DrillToInsight,
): SagaIterator<DashboardDrillToInsightResolved> {
    const { drillDefinition, drillEvent } = cmd.payload;
    const insight = yield select(selectInsightByRef(drillDefinition.target));
    yield put(drillToInsightRequested(ctx, insight, drillDefinition, drillEvent, cmd.correlationId));

    const enableDuplicatedLabelValuesInAttributeFilter: ReturnType<
        typeof selectEnableDuplicatedLabelValuesInAttributeFilter
    > = yield select(selectEnableDuplicatedLabelValuesInAttributeFilter);

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
        enableDuplicatedLabelValuesInAttributeFilter,
    );

    return drillToInsightResolved(
        ctx,
        insightWithDrillsApplied,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
