// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { IExecutionResult, IExportResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";

import { ExportRawInsightWidget } from "../../commands/index.js";
import { DashboardInsightWidgetExportResolved, insightWidgetExportResolved } from "../../events/insight.js";

import { DashboardContext } from "../../types/commonTypes.js";
import { createExportRawFunction } from "@gooddata/sdk-ui";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { defaultDimensionsGenerator, defWithDimensions, newDefForInsight } from "@gooddata/sdk-model";

async function performExport(execution: IExecutionResult): Promise<IExportResult> {
    return createExportRawFunction(execution);
}

function getExecutionResult(preparedExecution: IPreparedExecution) {
    return preparedExecution.execute();
}

export function* exportRawInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ExportRawInsightWidget,
): SagaIterator<DashboardInsightWidgetExportResolved> {
    const { insight } = cmd.payload;
    const { workspace, backend } = ctx;

    const definition = defWithDimensions(newDefForInsight(workspace, insight!), defaultDimensionsGenerator);

    const preparedExecution = backend.workspace(workspace).execution().forDefinition(definition);

    const executionResult: PromiseFnReturnType<typeof getExecutionResult> = yield call(
        getExecutionResult,
        preparedExecution,
    );

    // executionResult must be defined at this point
    invariant(executionResult);

    const result: PromiseFnReturnType<typeof performExport> = yield call(performExport, executionResult);

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
