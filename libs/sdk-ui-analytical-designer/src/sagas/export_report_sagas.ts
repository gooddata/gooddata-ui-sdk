// (C) 2007-2026 GoodData Corporation

import {
    type SagaReturnType,
    call,
    delay,
    fork,
    put,
    race,
    select,
    take,
    takeEvery,
} from "redux-saga/effects";
import { v4 as uuid } from "uuid";

import { type IExportResult, type UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { GdcErrorType } from "@gooddata/sdk-embedding";
import {
    type ICatalogAttribute,
    type IExecutionDefinition,
    type IInsight,
    type IInsightDefinition,
    defWithExecConfig,
    isCatalogAttribute,
} from "@gooddata/sdk-model";
import {
    type IExportFunction,
    type IExtendedExportConfig,
    type IGeoLayerExportInsight,
    createExportFunction,
    fillMissingTitles,
    prepareGeoInsightForDataExport,
    prepareGeoLayerInsightsForDataExport,
} from "@gooddata/sdk-ui";
import { getEffectiveConditionalFormatting } from "@gooddata/sdk-ui-ext";
import {
    type ICreateExportExecutionDefinitionOptions,
    createExportExecutionDefinition as createInternalExportExecutionDefinition,
} from "@gooddata/sdk-ui/internal";

import {
    type IExportRawAction,
    type IExportResultAction,
    type IExportResultReadyAction,
    exportResultError,
    exportResultFinished,
    exportResultStarted,
    hideExportSuccessMessage,
} from "../actions/export_report_actions.js";
import {
    type IExportReportAction,
    exportReportError,
    exportReportFinished,
    exportReportStarted,
} from "../actions/report_actions.js";
import { backend } from "../backend.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { BackendToBearConvertors } from "../convertors/index.js";
import {
    exportInsightFailed,
    exportInsightFinished,
} from "../postMessageApi/actions/export_insight_actions.js";
import { getPostMessageContextId } from "../postMessageApi/sagas/post_message_saga_helper.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { getExecutionConfig } from "../selectors/execution_config_selector.js";
import { exportResultTimeout, getFeatureFlags } from "../selectors/feature_flag_selector.js";
import {
    getInsightForRawExport,
    getInsightWithBucketsViaMd,
    getRawExportOverrides,
    getVisualizationClass,
} from "../selectors/insight_selectors.js";
import { getLocale } from "../selectors/intl_selector.js";
import { getIsEmbedded } from "../selectors/meta_selector.js";
import { getVisualizationForExportFromInsight } from "../services/report_service.js";
import { logExportResult, logOpenAsReport } from "../services/telemetry/tracking_events.js";
import { getCatalogItems } from "../store/catalog/catalog_selector.js";
import { type IAppState } from "../store/types.js";
import { type IVisualization } from "../typings/bear/bearTypes.js";
import { exportRawToServer, exportReportToServer } from "../utils/api.js";
import { downloadFile } from "../utils/downloader.js";
import { logError } from "../utils/logging/error_logging.js";
import { createRawExportExecutionDefinition } from "../utils/rawExport.js";
import { getDuration, getTime } from "../utils/timers.js";
import { getWorkspaceRef } from "../utils/uri.js";

export const HIDE_SUCCESS_MESSAGE_AFTER = 2500;

export const getId = (): string => uuid();

export async function performPreparedInsightExport(
    projectId: string,
    definition: IExecutionDefinition,
    exportConfig: IExtendedExportConfig,
): Promise<IExportResult> {
    const executionResult = await backend
        .workspace(projectId)
        .execution()
        .forDefinition(definition)
        .execute();
    const exporter = createExportFunction(executionResult);

    return exporter(exportConfig);
}

export async function performMultiLayerInsightExport(
    projectId: string,
    layers: Array<{ definition: IExecutionDefinition; title: string }>,
    exportConfig: IExtendedExportConfig,
): Promise<IExportResult> {
    const results = await Promise.all(
        layers.map(({ definition }) =>
            backend.workspace(projectId).execution().forDefinition(definition).execute(),
        ),
    );

    const [primaryResult, ...additionalResults] = results;
    const exporter = createExportFunction(primaryResult);

    return exporter({
        ...exportConfig,
        additionalExecutions: additionalResults.map((executionResult, index) => ({
            executionResult,
            title: layers[index + 1].title,
        })),
    });
}

export function exportUri(projectId: string, uri: string, workspacesRef = "workspaces") {
    return `${window.location.origin}/#s=/gdc/${workspacesRef}/${projectId}|analysisPage|${uri}|empty-report`;
}

export function redirectToReport(win: Window, location: string) {
    win.location.href = location;
}

export function* getInsightForExport(title: string) {
    const locale: ReturnType<typeof getLocale> = yield select(getLocale);
    const insight: ReturnType<typeof getInsightWithBucketsViaMd> = yield select(getInsightWithBucketsViaMd);
    const insightWithFilledTitles: SagaReturnType<typeof fillMissingTitles> = yield call(
        fillMissingTitles,
        insight,
        locale,
        undefined,
    );
    const report: ReturnType<typeof getVisualizationForExportFromInsight> = yield select(
        getVisualizationForExportFromInsight,
        title,
        insightWithFilledTitles,
    );

    const visClass: ReturnType<typeof getVisualizationClass> = yield select(getVisualizationClass);
    // the export report's meta is partial and its content nullable; the convertor only reads what exists
    return BackendToBearConvertors.convertVisualization(
        report as unknown as IVisualization,
        visClass.visualizationClass.uri,
    );
}

export function* exportReport(action: IExportReportAction) {
    const { title } = action.payload;
    const id: ReturnType<typeof getId> = yield call(getId);

    const startTime: ReturnType<typeof getTime> = yield call(getTime);

    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);

    yield put(exportReportStarted(id, projectId, startTime));

    const newWin: ReturnType<typeof window.open> = yield call(window.open, "", "_blank");

    const insight: IInsight = yield call(getInsightForExport, title);

    let exportResultUri: string | undefined;

    try {
        exportResultUri = yield call(exportReportToServer, projectId, insight);
    } catch (error) {
        logError("Error while exporting", error);

        const duration: ReturnType<typeof getDuration> = yield call(getDuration, startTime);
        yield put(exportReportError(id, projectId, startTime, duration, error));
        return;
    }
    yield call(redirectToReport, newWin, exportUri(projectId, exportResultUri, getWorkspaceRef(true)));

    const duration: ReturnType<typeof getDuration> = yield call(getDuration, startTime);

    yield put(exportReportFinished(id, projectId, startTime, duration, exportResultUri));

    const state: IAppState = yield select();

    yield call(logOpenAsReport, { state });
}

export function* rawExport(action: IExportRawAction) {
    const { title, options } = action.payload;
    let exportResult: IExportResult;

    const id: ReturnType<typeof getId> = yield call(getId);
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const insight: ReturnType<typeof getInsightForRawExport> = yield select(getInsightForRawExport);
    const customOverrides: ReturnType<typeof getRawExportOverrides> = yield select(getRawExportOverrides);
    const executionConfig: ReturnType<typeof getExecutionConfig> = yield select(getExecutionConfig);
    const timeout: ReturnType<typeof exportResultTimeout> = yield select(exportResultTimeout);
    const startTime: ReturnType<typeof getTime> = yield call(getTime);

    const definition = defWithExecConfig(
        createRawExportExecutionDefinition(projectId, insight),
        executionConfig,
    );

    yield put(exportResultStarted(id, projectId, startTime, {}));
    try {
        const fileName = `${title}.csv`;
        const effectiveTimeout = options?.timeout ?? timeout;
        exportResult = yield call(exportRawToServer, definition, projectId, fileName, customOverrides, {
            ...options,
            timeout: effectiveTimeout,
        });
        yield call(downloadFile, exportResult);

        const duration: ReturnType<typeof getDuration> = yield call(getDuration, startTime);
        yield put(exportResultFinished(id, projectId, startTime, duration, exportResult.uri, {}));

        yield delay(HIDE_SUCCESS_MESSAGE_AFTER);
        yield put(hideExportSuccessMessage());
    } catch (error) {
        const duration: ReturnType<typeof getDuration> = yield call(getDuration, startTime);

        yield put(
            exportResultError(
                id,
                projectId,
                startTime,
                duration,
                error as Error | UnexpectedResponseError,
                {},
            ),
        );
    }
}

export function* onExportResult(action: IExportResultAction, exportResultFunction: IExportFunction) {
    const {
        payload: { exportConfig, postMessageContext },
    } = action;

    const contextId: string = getPostMessageContextId(postMessageContext);
    const id: ReturnType<typeof getId> = yield call(getId);

    const startTime: ReturnType<typeof getTime> = yield call(getTime);

    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const timeout: ReturnType<typeof exportResultTimeout> = yield select(exportResultTimeout);
    const insight: ReturnType<typeof getInsightWithBucketsViaMd> = yield select(getInsightWithBucketsViaMd);
    const settings: ReturnType<typeof getFeatureFlags> = yield select(getFeatureFlags);

    const conditionalFormatting = getEffectiveConditionalFormatting(
        insight,
        settings,
        exportConfig.conditionalFormatting,
    );
    const exportConfigWithTimeout: IExtendedExportConfig = {
        ...exportConfig,
        timeout,
        ...(conditionalFormatting ? { conditionalFormatting } : {}),
    };

    yield put(exportResultStarted(id, projectId, startTime, exportConfigWithTimeout));
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);
    const catalogItems: ReturnType<typeof getCatalogItems> = yield select(getCatalogItems);
    const executionConfig: ReturnType<typeof getExecutionConfig> = yield select(getExecutionConfig);
    const catalogAttributes: ICatalogAttribute[] = catalogItems.filter(isCatalogAttribute);
    // Per-layer export is defined for XLSX (sheet per layer) and CSV (zipped file per layer) only;
    // other formats (PDF) keep the original single-execution behavior.
    const isMultiLayerExportFormat = exportConfig.format === "xlsx" || exportConfig.format === "csv";
    const layerInsights: IGeoLayerExportInsight[] | undefined = isMultiLayerExportFormat
        ? prepareGeoLayerInsightsForDataExport(insight, { settings, catalogAttributes })
        : undefined;
    const buildLayerDefinition = (
        tableInsight: IInsightDefinition,
        definitionOptions?: ICreateExportExecutionDefinitionOptions,
    ) =>
        defWithExecConfig(
            createInternalExportExecutionDefinition(
                tableInsight,
                projectId,
                createRawExportExecutionDefinition(projectId, insight),
                definitionOptions,
            ),
            executionConfig,
        );

    try {
        let exportResponse: IExportResult;
        if (layerInsights && layerInsights.length > 1) {
            exportResponse = yield call(
                performMultiLayerInsightExport,
                projectId,
                layerInsights.map((layer) => ({
                    title: layer.layerName,
                    // Layer filters live on the converted table insight, not in the base (root)
                    // execution — merge them in so each layer exports the data it displays.
                    definition: buildLayerDefinition(layer.tableInsight, {
                        includeInsightFilters: true,
                        attributeLocalIdMapping: layer.attributeLocalIdMapping,
                    }),
                })),
                exportConfigWithTimeout,
            );
        } else {
            const preparedInsight =
                prepareGeoInsightForDataExport(insight, {
                    settings,
                    catalogAttributes,
                }) ?? insight;
            exportResponse =
                preparedInsight === insight
                    ? yield call(exportResultFunction, exportConfigWithTimeout)
                    : yield call(
                          performPreparedInsightExport,
                          projectId,
                          buildLayerDefinition(preparedInsight),
                          exportConfigWithTimeout,
                      );
        }

        yield call(downloadFile, exportResponse);

        const duration: ReturnType<typeof getDuration> = yield call(getDuration, startTime);
        yield put(
            exportResultFinished(
                id,
                projectId,
                startTime,
                duration,
                exportResponse.uri,
                exportConfigWithTimeout,
            ),
        );
        if (isEmbedded) {
            yield put(
                exportInsightFinished({
                    projectId,
                    exportConfig: exportConfigWithTimeout,
                    time: duration,
                    exportFileLink: exportResponse.uri,
                    contextId,
                }),
            );
        }

        const state: IAppState = yield select();
        yield call(logExportResult, { state });

        yield delay(HIDE_SUCCESS_MESSAGE_AFTER);
        yield put(hideExportSuccessMessage());
    } catch (error) {
        const duration: ReturnType<typeof getDuration> = yield call(getDuration, startTime);
        if (isEmbedded) {
            yield put(
                exportInsightFailed({
                    projectId,
                    contextId,
                    exportConfig,
                    time: duration,
                    runTimeError: error as Error | UnexpectedResponseError,
                    errorCode: GdcErrorType.RuntimeError,
                }),
            );
        }
        yield put(
            exportResultError(
                id,
                projectId,
                startTime,
                duration,
                error as Error | UnexpectedResponseError,
                exportConfig,
            ),
        );
    }
}

function* watchExportResultReady() {
    let exportResultFunction: IExportFunction;

    while (true) {
        const {
            newExportAction,
            exportResultAction,
            rawExportResultAction,
        }: {
            newExportAction: IExportResultReadyAction;
            exportResultAction: IExportResultAction;
            rawExportResultAction: IExportRawAction;
        } = yield race({
            newExportAction: take(ActionTypeKeys.EXPORT_RESULT_READY),
            exportResultAction: take(ActionTypeKeys.EXPORT_RESULT),
            rawExportResultAction: take(ActionTypeKeys.RAW_EXPORT_REQUESTED),
        });

        if (newExportAction) {
            exportResultFunction = newExportAction.payload.exportResultFunction;
        } else if (exportResultAction) {
            if (!exportResultFunction) {
                const action: IExportResultReadyAction = yield take(ActionTypeKeys.EXPORT_RESULT_READY);
                exportResultFunction = action.payload.exportResultFunction;
            }
            yield call(onExportResult, exportResultAction, exportResultFunction);
        } else if (rawExportResultAction) {
            yield call(rawExport, rawExportResultAction);
        }
    }
}

export function* watchExportReport() {
    yield takeEvery(ActionTypeKeys.REPORT_EXPORT_REQUESTED, exportReport);
    yield fork(watchExportResultReady);
}
