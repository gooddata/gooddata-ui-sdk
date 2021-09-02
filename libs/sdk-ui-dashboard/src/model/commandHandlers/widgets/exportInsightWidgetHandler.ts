// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { serializeObjRef } from "@gooddata/sdk-model";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";

import { ExportInsightWidget } from "../../commands";
import { invalidArgumentsProvided } from "../../events/general";
import {
    DashboardInsightWidgetExportResolved,
    insightWidgetExportRequested,
    insightWidgetExportResolved,
} from "../../events/insight";
import { selectWidgetExecutionByWidgetRef } from "../../state/widgetExecutions/widgetExecutionsSelectors";
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

export function* exportInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ExportInsightWidget,
): SagaIterator<DashboardInsightWidgetExportResolved> {
    const { config, ref } = cmd.payload;

    yield put(insightWidgetExportRequested(ctx, ref, config));

    const execution: ReturnType<ReturnType<typeof selectWidgetExecutionByWidgetRef>> = yield select(
        selectWidgetExecutionByWidgetRef(ref),
    );

    if (!execution) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Cannot find insight widget with ref: ${serializeObjRef(ref)}.`,
        );
    }

    if (!execution.executionResult) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `The widget with ref: ${serializeObjRef(
                ref,
            )} cannot be exported at the moment because there is no execution result for it.`,
        );
    }

    const resultUri: PromiseFnReturnType<typeof performExport> = yield call(
        performExport,
        execution.executionResult,
        config,
    );

    return insightWidgetExportResolved(ctx, resultUri);
}
