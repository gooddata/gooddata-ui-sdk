// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { serializeObjRef } from "@gooddata/sdk-model";
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
    selectWidgetExecutionByWidgetRef,
    selectWidgetIsExportableToCsvByWidgetRef,
    selectWidgetIsExportableToXlsxByWidgetRef,
    selectWidgetIsReadyForExportByWidgetRef,
} from "../../state/widgetExecutions/widgetExecutionsSelectors";
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

function* validateSettingsAndPermissions(
    ctx: DashboardContext,
    cmd: ExportInsightWidget,
): SagaIterator<void> {
    const { config, ref } = cmd.payload;

    let canExport = false;
    if (config.format === "csv") {
        canExport = yield select(selectWidgetIsExportableToCsvByWidgetRef(ref));
    }

    if (config.format === "xlsx") {
        canExport = yield select(selectWidgetIsExportableToXlsxByWidgetRef(ref));
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

    yield put(insightWidgetExportRequested(ctx, ref, config));

    const isExportable: ReturnType<ReturnType<typeof selectWidgetIsReadyForExportByWidgetRef>> = yield select(
        selectWidgetIsReadyForExportByWidgetRef(ref),
    );

    if (!isExportable) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `The widget with ref: ${serializeObjRef(ref)} cannot be exported at the moment.`,
        );
    }

    yield call(validateSettingsAndPermissions, ctx, cmd);

    const execution: ReturnType<ReturnType<typeof selectWidgetExecutionByWidgetRef>> = yield select(
        selectWidgetExecutionByWidgetRef(ref),
    );

    // executionResult must be defined at this point
    invariant(execution?.executionResult);

    const resultUri: PromiseFnReturnType<typeof performExport> = yield call(
        performExport,
        execution.executionResult,
        config,
    );

    return insightWidgetExportResolved(ctx, resultUri);
}
