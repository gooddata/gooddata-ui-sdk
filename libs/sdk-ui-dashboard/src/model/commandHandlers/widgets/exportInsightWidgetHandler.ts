// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { type IExecutionResult, type IExportResult } from "@gooddata/sdk-backend-spi";
import { type IExecutionDefinition, type ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import {
    type IExtendedExportConfig,
    createExportFunction,
    prepareGeoInsightForDataExport,
} from "@gooddata/sdk-ui";
import { createExportExecutionDefinition } from "@gooddata/sdk-ui/internal";

import { type IExportInsightWidget } from "../../commands/insight.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import {
    type IDashboardInsightWidgetExportResolved,
    insightWidgetExportRequested,
    insightWidgetExportResolved,
} from "../../events/insight.js";
import { selectCatalogAttributes } from "../../store/catalog/catalogSelectors.js";
import { selectExportResultPollingTimeout, selectSettings } from "../../store/config/configSelectors.js";
import {
    selectExecutionResultByRef,
    selectIsExecutionResultExportableToCsvByRef,
    selectIsExecutionResultExportableToPdfByRef,
    selectIsExecutionResultExportableToXlsxByRef,
    selectIsExecutionResultReadyForExportByRef,
} from "../../store/executionResults/executionResultsSelectors.js";
import { selectInsightByWidgetRef } from "../../store/insights/insightsSelectors.js";
import { selectPreloadedAttributesWithReferences } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";

async function performExport(
    ctx: DashboardContext,
    executionResult: IExecutionResult,
    config: IExtendedExportConfig,
    exportDefinition?: IExecutionDefinition,
): Promise<IExportResult> {
    const exportExecutionResult = exportDefinition
        ? await ctx.backend.workspace(ctx.workspace).execution().forDefinition(exportDefinition).execute()
        : executionResult;
    const exporter = createExportFunction(exportExecutionResult);

    return exporter(config);
}

function* validateIsExportable(
    ctx: DashboardContext,
    cmd: IExportInsightWidget,
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
    cmd: IExportInsightWidget,
): SagaIterator<void> {
    const { config, ref } = cmd.payload;

    let canExport = false;
    if (config.format === "csv") {
        canExport = yield select(selectIsExecutionResultExportableToCsvByRef(ref));
    }

    if (config.format === "xlsx") {
        canExport = yield select(selectIsExecutionResultExportableToXlsxByRef(ref));
    }

    if (config.format === "pdf") {
        canExport = yield select(selectIsExecutionResultExportableToPdfByRef(ref));
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
    cmd: IExportInsightWidget,
): SagaIterator<IDashboardInsightWidgetExportResolved> {
    const { config, ref, insight: payloadInsight } = cmd.payload;

    yield put(insightWidgetExportRequested(ctx, ref, config, cmd.correlationId));

    yield call(validateIsExportable, ctx, cmd, ref);
    yield call(validateSettingsAndPermissions, ctx, cmd);

    const executionEnvelope: ReturnType<ReturnType<typeof selectExecutionResultByRef>> = yield select(
        selectExecutionResultByRef(ref),
    );

    // executionResult must be defined at this point
    invariant(executionEnvelope?.executionResult);

    const insight: ReturnType<ReturnType<typeof selectInsightByWidgetRef>> =
        payloadInsight ?? (yield select(selectInsightByWidgetRef(ref)));
    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
    const catalogAttributes: ReturnType<typeof selectCatalogAttributes> =
        yield select(selectCatalogAttributes);
    const preloadedAttributesWithReferences: ReturnType<typeof selectPreloadedAttributesWithReferences> =
        yield select(selectPreloadedAttributesWithReferences);
    let exportDefinition: IExecutionDefinition | undefined;
    if (insight) {
        const exportInsight =
            prepareGeoInsightForDataExport(insight, {
                settings,
                catalogAttributes,
                preloadedAttributesWithReferences,
            }) ?? insight;

        exportDefinition =
            exportInsight === insight
                ? undefined
                : createExportExecutionDefinition(
                      exportInsight,
                      ctx.workspace,
                      executionEnvelope.executionResult.definition,
                  );
    }

    const timeout: ReturnType<typeof selectExportResultPollingTimeout> = yield select(
        selectExportResultPollingTimeout,
    );

    const result: PromiseFnReturnType<typeof performExport> = yield call(
        performExport,
        ctx,
        executionEnvelope.executionResult,
        { ...config, timeout },
        exportDefinition,
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
