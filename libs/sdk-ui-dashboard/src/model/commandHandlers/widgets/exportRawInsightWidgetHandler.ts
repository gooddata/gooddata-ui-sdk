// (C) 2024-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { IExecutionResult, IExportResult } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";
import { ExportRawInsightWidget } from "../../commands/index.js";
import { DashboardInsightWidgetExportResolved, insightWidgetExportResolved } from "../../events/insight.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { createExportRawFunction } from "@gooddata/sdk-ui";
import { PromiseFnReturnType } from "../../types/sagas.js";

import { selectExecutionResultByRef } from "../../store/executionResults/executionResultsSelectors.js";

async function performExport(execution: IExecutionResult, filename: string): Promise<IExportResult> {
    return createExportRawFunction(execution, filename);
}

export function* exportRawInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ExportRawInsightWidget,
): SagaIterator<DashboardInsightWidgetExportResolved> {
    const { filename, ref } = cmd.payload;

    const executionEnvelope: ReturnType<ReturnType<typeof selectExecutionResultByRef>> = yield select(
        selectExecutionResultByRef(ref),
    );

    // executionResult must be defined at this point
    invariant(executionEnvelope?.executionResult);

    const result: PromiseFnReturnType<typeof performExport> = yield call(
        performExport,
        executionEnvelope.executionResult,
        filename,
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
