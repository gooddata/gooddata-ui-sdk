// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { IExecutionResult, IExportResult } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";

import { ExportInsightWidget } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { DashboardInsightWidgetExportResolved, insightWidgetExportResolved } from "../../events/insight.js";
import {
    selectExecutionResultByRef,
    selectIsExecutionResultReadyForExportByRef,
} from "../../store/executionResults/executionResultsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { createExportRawFunction } from "@gooddata/sdk-ui";
import { PromiseFnReturnType } from "../../types/sagas.js";

async function performExport(executionResult: IExecutionResult): Promise<IExportResult> {
    const exporter = createExportRawFunction(executionResult);
    return exporter;
}

function* validateIsExportable(
    ctx: DashboardContext,
    cmd: ExportInsightWidget,
    ref: ObjRef,
): SagaIterator<void> {
    const isExportable: ReturnType<ReturnType<typeof selectIsExecutionResultReadyForExportByRef>> =
        yield select(selectIsExecutionResultReadyForExportByRef(ref));

    if (!isExportable) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `The widget with ref: ${serializeObjRef(ref)} cannot be exported at the moment.`,
        );
    }
}

export function* exportRawInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ExportInsightWidget,
): SagaIterator<DashboardInsightWidgetExportResolved> {
    const { ref } = cmd.payload;

    // yield put(insightWidgetExportRequested(ctx, ref, config, cmd.correlationId));

    yield call(validateIsExportable, ctx, cmd, ref);

    const executionEnvelope: ReturnType<ReturnType<typeof selectExecutionResultByRef>> = yield select(
        selectExecutionResultByRef(ref),
    );

    // executionResult must be defined at this point
    invariant(executionEnvelope?.executionResult);

    const result: PromiseFnReturnType<typeof performExport> = yield call(
        performExport,
        executionEnvelope.executionResult,
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
