// (C) 2024-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { IExportResult, IRawExportCustomOverrides } from "@gooddata/sdk-backend-spi";
import {
    IExecutionDefinition,
    INullableFilter,
    defWithDimensions,
    defaultDimensionsGenerator,
    insightRef,
    newDefForInsight,
} from "@gooddata/sdk-model";

import { filterContextItemsToDashboardFiltersByWidget } from "../../../converters/index.js";
import { ExportRawInsightWidget } from "../../commands/index.js";
import { DashboardInsightWidgetExportResolved, insightWidgetExportResolved } from "../../events/insight.js";
import { selectExecutionResultByRef } from "../../store/executionResults/executionResultsSelectors.js";
import { selectFilterContextFilters } from "../../store/filterContext/filterContextSelectors.js";
import { selectRawExportOverridesForInsightByRef } from "../../store/insights/insightsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";

async function exportDashboardToCSVRaw(
    ctx: DashboardContext,
    definition: IExecutionDefinition,
    filename: string,
    overrides?: IRawExportCustomOverrides,
): Promise<IExportResult> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().exportDashboardToCSVRaw(definition, filename, overrides);
}

export function* exportRawInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ExportRawInsightWidget,
): SagaIterator<DashboardInsightWidgetExportResolved> {
    const { ref, widget, insight, filename } = cmd.payload;
    const { workspace } = ctx;

    const executionEnvelope: ReturnType<ReturnType<typeof selectExecutionResultByRef>> = yield select(
        selectExecutionResultByRef(ref),
    );

    const filterContextFilters: ReturnType<typeof selectFilterContextFilters> =
        yield select(selectFilterContextFilters);

    const mergedFilters: INullableFilter[] = [
        ...insight.insight.filters,
        ...filterContextItemsToDashboardFiltersByWidget(filterContextFilters, widget),
    ];

    const definition = defWithDimensions(
        newDefForInsight(workspace, insight!, mergedFilters),
        defaultDimensionsGenerator,
    );

    const preparedExecutionDefinition = executionEnvelope?.executionResult?.definition ?? definition;

    // execution definition must be defined at this point
    invariant(preparedExecutionDefinition);

    const overrides: ReturnType<ReturnType<typeof selectRawExportOverridesForInsightByRef>> = yield select(
        selectRawExportOverridesForInsightByRef(insightRef(insight)),
    );

    const result: PromiseFnReturnType<typeof exportDashboardToCSVRaw> = yield call(
        exportDashboardToCSVRaw,
        ctx,
        preparedExecutionDefinition,
        filename,
        overrides,
    );

    // prepend hostname if provided so that the results are downloaded from there, not from where the app is hosted
    const fullUri = ctx.backend.config.hostname
        ? new URL(result.uri, ctx.backend.config.hostname).href
        : result.uri;
    const sanitizedResult: IExportResult = {
        ...result,
        uri: fullUri,
    };

    return insightWidgetExportResolved(ctx, sanitizedResult, cmd.correlationId);
}
