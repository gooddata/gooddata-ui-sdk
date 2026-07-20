// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { type IExecutionResult, type IExportResult } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionDefinition,
    type IInsightDefinition,
    type ObjRef,
    serializeObjRef,
} from "@gooddata/sdk-model";
import {
    type IExtendedExportConfig,
    createExportFunction,
    prepareGeoInsightForDataExport,
    prepareGeoLayerInsightsForDataExport,
} from "@gooddata/sdk-ui";
import {
    type ICreateExportExecutionDefinitionOptions,
    createExportExecutionDefinition,
} from "@gooddata/sdk-ui/internal";

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

async function performMultiLayerExport(
    ctx: DashboardContext,
    layers: Array<{ definition: IExecutionDefinition; title: string }>,
    config: IExtendedExportConfig,
): Promise<IExportResult> {
    const results = await Promise.all(
        layers.map(({ definition }) =>
            ctx.backend.workspace(ctx.workspace).execution().forDefinition(definition).execute(),
        ),
    );

    const [primaryResult, ...additionalResults] = results;
    const exporter = createExportFunction(primaryResult);

    return exporter({
        ...config,
        additionalExecutions: additionalResults.map((executionResult, index) => ({
            executionResult,
            title: layers[index + 1].title,
        })),
    });
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
    const executionResult = executionEnvelope.executionResult;

    const insight: ReturnType<ReturnType<typeof selectInsightByWidgetRef>> =
        payloadInsight ?? (yield select(selectInsightByWidgetRef(ref)));
    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
    const catalogAttributes: ReturnType<typeof selectCatalogAttributes> =
        yield select(selectCatalogAttributes);
    const preloadedAttributesWithReferences: ReturnType<typeof selectPreloadedAttributesWithReferences> =
        yield select(selectPreloadedAttributesWithReferences);

    const buildLayerDefinition = (
        tableInsight: IInsightDefinition,
        definitionOptions?: ICreateExportExecutionDefinitionOptions,
    ) =>
        createExportExecutionDefinition(
            tableInsight,
            ctx.workspace,
            executionResult.definition,
            definitionOptions,
        );

    // Per-layer export is defined for XLSX (sheet per layer) and CSV (zipped file per layer) only;
    // other formats (PDF) keep the original single-execution behavior.
    const isMultiLayerExportFormat = config.format === "xlsx" || config.format === "csv";
    const layerInsights =
        insight && isMultiLayerExportFormat
            ? prepareGeoLayerInsightsForDataExport(insight, {
                  settings,
                  catalogAttributes,
                  preloadedAttributesWithReferences,
              })
            : undefined;

    const timeout: ReturnType<typeof selectExportResultPollingTimeout> = yield select(
        selectExportResultPollingTimeout,
    );

    let result: IExportResult;
    if (layerInsights && layerInsights.length > 1) {
        result = yield call(
            performMultiLayerExport,
            ctx,
            layerInsights.map((layer) => ({
                title: layer.layerName,
                // Layer filters live on the converted table insight, not in the base (root)
                // execution — merge them in so each layer exports the data it displays.
                definition: buildLayerDefinition(layer.tableInsight, {
                    includeInsightFilters: true,
                    attributeLocalIdMapping: layer.attributeLocalIdMapping,
                }),
            })),
            { ...config, timeout },
        );
    } else {
        const exportInsight = insight
            ? (prepareGeoInsightForDataExport(insight, {
                  settings,
                  catalogAttributes,
                  preloadedAttributesWithReferences,
              }) ?? insight)
            : undefined;
        const exportDefinition =
            exportInsight && exportInsight !== insight ? buildLayerDefinition(exportInsight) : undefined;
        result = yield call(performExport, ctx, executionResult, { ...config, timeout }, exportDefinition);
    }

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
