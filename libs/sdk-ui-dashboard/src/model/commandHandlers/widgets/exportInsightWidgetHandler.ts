// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";

import { ExportInsightWidget } from "../../commands";
import { invalidArgumentsProvided } from "../../events/general";
import {
    DashboardInsightWidgetExportResolved,
    insightWidgetExportRequested,
    insightWidgetExportResolved,
} from "../../events/insight";
import {
    selectExecutionResultByRef,
    selectIsExecutionResultReadyForExportByRef,
    selectIsExecutionResultExportableToCsvByRef,
    selectIsExecutionResultExportableToXlsxByRef,
} from "../../store/executionResults/executionResultsSelectors";
import { DashboardContext } from "../../types/commonTypes";
import { createExportFunction, IExtendedExportConfig } from "@gooddata/sdk-ui";
import { PromiseFnReturnType } from "../../types/sagas";

async function performExport(
    executionResult: IExecutionResult,
    config: IExtendedExportConfig,
): Promise<string> {
    const exporter = createExportFunction(executionResult);
    const result = await exporter(config);
    return result.uri;
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

function* validateSettingsAndPermissions(
    ctx: DashboardContext,
    cmd: ExportInsightWidget,
): SagaIterator<void> {
    const { config, ref } = cmd.payload;

    let canExport = false;
    if (config.format === "csv") {
        canExport = yield select(selectIsExecutionResultExportableToCsvByRef(ref));
    }

    if (config.format === "xlsx") {
        canExport = yield select(selectIsExecutionResultExportableToXlsxByRef(ref));
    }

    if (!canExport) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `The widget with ref: ${serializeObjRef(
                ref,
            )} cannot be exported because the feature is disabled or the user does not have the necessary permissions.`,
        );
    }
}

export function* exportInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ExportInsightWidget,
): SagaIterator<DashboardInsightWidgetExportResolved> {
    const { config, ref } = cmd.payload;

    yield put(insightWidgetExportRequested(ctx, ref, config, cmd.correlationId));

    yield call(validateIsExportable, ctx, cmd, ref);
    yield call(validateSettingsAndPermissions, ctx, cmd);

    const executionEnvelope: ReturnType<ReturnType<typeof selectExecutionResultByRef>> = yield select(
        selectExecutionResultByRef(ref),
    );

    // executionResult must be defined at this point
    invariant(executionEnvelope?.executionResult);

    const resultUri: PromiseFnReturnType<typeof performExport> = yield call(
        performExport,
        executionEnvelope.executionResult,
        config,
    );

    return insightWidgetExportResolved(ctx, resultUri, cmd.correlationId);
}
