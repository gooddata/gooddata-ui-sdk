// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { call, delay, select } from "redux-saga/effects";
import { describe, expect, it, vi } from "vitest";

import {
    type IConditionalFormatting,
    type IExecutionConfig,
    defWithExecConfig,
    idRef,
    newInsightDefinition,
} from "@gooddata/sdk-model";
import {
    type IExtendedExportConfig,
    type IGeoLayerExportInsight,
    prepareGeoInsightForDataExport,
    prepareGeoLayerInsightsForDataExport,
} from "@gooddata/sdk-ui";
import { createExportExecutionDefinition } from "@gooddata/sdk-ui/internal";

import {
    exportRaw as exportRawAction,
    exportResult as exportResultAction,
    exportResultFinished,
    exportResultStarted,
    hideExportSuccessMessage,
} from "../actions/export_report_actions.js";
import { LOCAL_TABLE } from "../constants/visualization_types.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { getExecutionConfig } from "../selectors/execution_config_selector.js";
import { exportResultTimeout, getFeatureFlags } from "../selectors/feature_flag_selector.js";
import {
    getInsightForRawExport,
    getInsightWithBucketsViaMd,
    getRawExportOverrides,
} from "../selectors/insight_selectors.js";
import { getIsEmbedded } from "../selectors/meta_selector.js";
import { logExportResult } from "../services/telemetry/tracking_events.js";
import { getCatalogItems } from "../store/catalog/catalog_selector.js";
import { exportRawToServer } from "../utils/api.js";
import { downloadFile } from "../utils/downloader.js";
import { createRawExportExecutionDefinition } from "../utils/rawExport.js";
import { getDuration, getTime } from "../utils/timers.js";

import {
    HIDE_SUCCESS_MESSAGE_AFTER,
    getId,
    onExportResult,
    performMultiLayerInsightExport,
    performPreparedInsightExport,
    rawExport,
} from "./export_report_sagas.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("@gooddata/sdk-ui", async (importActual) => {
    const actual = await importActual<Record<string, unknown>>();
    return {
        ...actual,
        prepareGeoInsightForDataExport: vi.fn(),
        prepareGeoLayerInsightsForDataExport: vi.fn(),
    };
});

const projectId = "workspaceId";
const startTime = 1000;
const duration = 250;
const defaultTimeout = 60000;
const exportResult = {
    uri: "/gdc/exports/1",
    objectUrl: "blob:export",
    fileName: "export.csv",
};

describe("export_report_sagas", () => {
    describe("rawExport", () => {
        it("should preserve caller timeout override for raw CSV export", async () => {
            const title = "Raw export";
            const customTimeout = 12345;
            const insight = newInsightDefinition(LOCAL_TABLE);
            const customOverrides = {};
            const options = { delimiter: ";", timeout: customTimeout };
            const expectedDefinition = defWithExecConfig(
                createRawExportExecutionDefinition(projectId, insight),
                {},
            );

            const action = exportRawAction(title, options);

            await expectSaga(rawExport, action)
                .provide([
                    [call(getId), "export-id"],
                    [select(getProjectId), projectId],
                    [select(getInsightForRawExport), insight],
                    [select(getRawExportOverrides), customOverrides],
                    [select(getExecutionConfig), {}],
                    [select(exportResultTimeout), defaultTimeout],
                    [call(getTime), startTime],
                    [matchers.call.fn(exportRawToServer), exportResult],
                    [matchers.call.fn(downloadFile), undefined],
                    [call(getDuration, startTime), duration],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .call(exportRawToServer, expectedDefinition, projectId, `${title}.csv`, customOverrides, {
                    delimiter: ";",
                    timeout: customTimeout,
                })
                .put(exportResultStarted("export-id", projectId, startTime, {}))
                .put(exportResultFinished("export-id", projectId, startTime, duration, exportResult.uri, {}))
                .put(hideExportSuccessMessage())
                .run();
        });

        it("should apply the active parameter override to the raw export definition", async () => {
            const title = "Raw export";
            const insight = newInsightDefinition(LOCAL_TABLE);
            const customOverrides = {};
            const executionConfig: IExecutionConfig = {
                parameterValues: [{ ref: idRef("qa-param-topn", "parameter"), value: 8000 }],
            };
            const expectedDefinition = defWithExecConfig(
                createRawExportExecutionDefinition(projectId, insight),
                executionConfig,
            );

            const action = exportRawAction(title);

            await expectSaga(rawExport, action)
                .provide([
                    [call(getId), "export-id"],
                    [select(getProjectId), projectId],
                    [select(getInsightForRawExport), insight],
                    [select(getRawExportOverrides), customOverrides],
                    [select(getExecutionConfig), executionConfig],
                    [select(exportResultTimeout), defaultTimeout],
                    [call(getTime), startTime],
                    [matchers.call.fn(exportRawToServer), exportResult],
                    [matchers.call.fn(downloadFile), undefined],
                    [call(getDuration, startTime), duration],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .call(exportRawToServer, expectedDefinition, projectId, `${title}.csv`, customOverrides, {
                    timeout: defaultTimeout,
                })
                .run();

            // the definition carrying parameterValues must reach the export
            expect(expectedDefinition.executionConfig?.parameterValues).toEqual(
                executionConfig.parameterValues,
            );
        });
    });

    describe("onExportResult", () => {
        it("should apply the execution config to the geo-insight export definition", async () => {
            const baseInsight = newInsightDefinition(LOCAL_TABLE);
            const geoInsight = newInsightDefinition(LOCAL_TABLE);
            vi.mocked(prepareGeoInsightForDataExport).mockReturnValue(geoInsight);

            const executionConfig: IExecutionConfig = {
                parameterValues: [{ ref: idRef("qa-param-topn", "parameter"), value: 8000 }],
            };
            const exportConfig = { title: "Export", format: "xlsx" } as IExtendedExportConfig;
            const exportConfigWithTimeout: IExtendedExportConfig = {
                ...exportConfig,
                timeout: defaultTimeout,
            };

            const expectedDefinition = defWithExecConfig(
                createExportExecutionDefinition(
                    geoInsight,
                    projectId,
                    createRawExportExecutionDefinition(projectId, baseInsight),
                ),
                executionConfig,
            );

            await expectSaga(onExportResult, exportResultAction(exportConfig), vi.fn())
                .withState({})
                .provide([
                    [call(getId), "export-id"],
                    [call(getTime), startTime],
                    [select(getProjectId), projectId],
                    [select(exportResultTimeout), defaultTimeout],
                    [select(getIsEmbedded), false],
                    [select(getInsightWithBucketsViaMd), baseInsight],
                    [select(getFeatureFlags), {}],
                    [select(getCatalogItems), []],
                    [select(getExecutionConfig), executionConfig],
                    [matchers.call.fn(performPreparedInsightExport), exportResult],
                    [matchers.call.fn(downloadFile), undefined],
                    [call(getDuration, startTime), duration],
                    [matchers.call.fn(logExportResult), undefined],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .call(performPreparedInsightExport, projectId, expectedDefinition, exportConfigWithTimeout)
                .run();
        });

        it("exports each layer separately for a multi-layer geo insight", async () => {
            const baseInsight = newInsightDefinition(LOCAL_TABLE);
            const rootTable = newInsightDefinition(LOCAL_TABLE);
            const layerTable = newInsightDefinition(LOCAL_TABLE);
            const layerInsights: IGeoLayerExportInsight[] = [
                { layerId: "root", layerName: "Root", tableInsight: rootTable },
                { layerId: "layer-1", layerName: "Cities", tableInsight: layerTable },
            ];
            vi.mocked(prepareGeoLayerInsightsForDataExport).mockReturnValue(layerInsights);

            const executionConfig: IExecutionConfig = {};
            const exportConfig = { title: "Export", format: "xlsx" } as IExtendedExportConfig;
            const exportConfigWithTimeout: IExtendedExportConfig = {
                ...exportConfig,
                timeout: defaultTimeout,
            };

            const expectedLayers = layerInsights.map((layer) => ({
                title: layer.layerName,
                definition: defWithExecConfig(
                    createExportExecutionDefinition(
                        layer.tableInsight,
                        projectId,
                        createRawExportExecutionDefinition(projectId, baseInsight),
                        {
                            includeInsightFilters: true,
                            attributeLocalIdMapping: layer.attributeLocalIdMapping,
                        },
                    ),
                    executionConfig,
                ),
            }));

            await expectSaga(onExportResult, exportResultAction(exportConfig), vi.fn())
                .withState({})
                .provide([
                    [call(getId), "export-id"],
                    [call(getTime), startTime],
                    [select(getProjectId), projectId],
                    [select(exportResultTimeout), defaultTimeout],
                    [select(getIsEmbedded), false],
                    [select(getInsightWithBucketsViaMd), baseInsight],
                    [select(getFeatureFlags), {}],
                    [select(getCatalogItems), []],
                    [select(getExecutionConfig), executionConfig],
                    [matchers.call.fn(performMultiLayerInsightExport), exportResult],
                    [matchers.call.fn(downloadFile), undefined],
                    [call(getDuration, startTime), duration],
                    [matchers.call.fn(logExportResult), undefined],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .call(performMultiLayerInsightExport, projectId, expectedLayers, exportConfigWithTimeout)
                .run();
        });

        it("keeps the single-execution path for PDF exports of a multi-layer geo insight", async () => {
            const baseInsight = newInsightDefinition(LOCAL_TABLE);
            const geoInsight = newInsightDefinition(LOCAL_TABLE);
            vi.mocked(prepareGeoLayerInsightsForDataExport).mockReturnValue([
                { layerId: "root", layerName: "Root", tableInsight: newInsightDefinition(LOCAL_TABLE) },
                { layerId: "layer-1", layerName: "Cities", tableInsight: newInsightDefinition(LOCAL_TABLE) },
            ]);
            vi.mocked(prepareGeoInsightForDataExport).mockReturnValue(geoInsight);

            const executionConfig: IExecutionConfig = {};
            const exportConfig = { title: "Export", format: "pdf" } as IExtendedExportConfig;
            const exportConfigWithTimeout: IExtendedExportConfig = {
                ...exportConfig,
                timeout: defaultTimeout,
            };

            const expectedDefinition = defWithExecConfig(
                createExportExecutionDefinition(
                    geoInsight,
                    projectId,
                    createRawExportExecutionDefinition(projectId, baseInsight),
                ),
                executionConfig,
            );

            await expectSaga(onExportResult, exportResultAction(exportConfig), vi.fn())
                .withState({})
                .provide([
                    [call(getId), "export-id"],
                    [call(getTime), startTime],
                    [select(getProjectId), projectId],
                    [select(exportResultTimeout), defaultTimeout],
                    [select(getIsEmbedded), false],
                    [select(getInsightWithBucketsViaMd), baseInsight],
                    [select(getFeatureFlags), {}],
                    [select(getCatalogItems), []],
                    [select(getExecutionConfig), executionConfig],
                    [matchers.call.fn(performPreparedInsightExport), exportResult],
                    [matchers.call.fn(downloadFile), undefined],
                    [call(getDuration, startTime), duration],
                    [matchers.call.fn(logExportResult), undefined],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .call(performPreparedInsightExport, projectId, expectedDefinition, exportConfigWithTimeout)
                .not.call.fn(performMultiLayerInsightExport)
                .run();
        });

        it("attaches the insight's conditional formatting to the export config when the feature is enabled", async () => {
            const conditionalFormatting: IConditionalFormatting = { enabled: true, rules: [] };
            const baseInsight = newInsightDefinition(LOCAL_TABLE, (builder) =>
                builder.properties({ controls: { conditionalFormatting } }),
            );
            const geoInsight = newInsightDefinition(LOCAL_TABLE);
            vi.mocked(prepareGeoInsightForDataExport).mockReturnValue(geoInsight);

            const executionConfig: IExecutionConfig = {};
            const exportConfig = { title: "Export", format: "xlsx" } as IExtendedExportConfig;
            const exportConfigWithTimeout = {
                ...exportConfig,
                timeout: defaultTimeout,
                conditionalFormatting,
            };

            const expectedDefinition = defWithExecConfig(
                createExportExecutionDefinition(
                    geoInsight,
                    projectId,
                    createRawExportExecutionDefinition(projectId, baseInsight),
                ),
                executionConfig,
            );

            await expectSaga(onExportResult, exportResultAction(exportConfig), vi.fn())
                .withState({})
                .provide([
                    [call(getId), "export-id"],
                    [call(getTime), startTime],
                    [select(getProjectId), projectId],
                    [select(exportResultTimeout), defaultTimeout],
                    [select(getIsEmbedded), false],
                    [select(getInsightWithBucketsViaMd), baseInsight],
                    [
                        select(getFeatureFlags),
                        { enableConditionalFormatting: true, enableNewPivotTable: true },
                    ],
                    [select(getCatalogItems), []],
                    [select(getExecutionConfig), executionConfig],
                    [matchers.call.fn(performPreparedInsightExport), exportResult],
                    [matchers.call.fn(downloadFile), undefined],
                    [call(getDuration, startTime), duration],
                    [matchers.call.fn(logExportResult), undefined],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .call(performPreparedInsightExport, projectId, expectedDefinition, exportConfigWithTimeout)
                .run();
        });

        it("does not let an explicit exportConfig.conditionalFormatting override bypass a disabled feature flag", async () => {
            const explicitConditionalFormatting: IConditionalFormatting = { enabled: true, rules: [] };
            const baseInsight = newInsightDefinition(LOCAL_TABLE);
            const geoInsight = newInsightDefinition(LOCAL_TABLE);
            vi.mocked(prepareGeoInsightForDataExport).mockReturnValue(geoInsight);

            const executionConfig: IExecutionConfig = {};
            const exportConfig = {
                title: "Export",
                format: "xlsx",
                conditionalFormatting: explicitConditionalFormatting,
            } as IExtendedExportConfig;
            const exportConfigWithTimeout: IExtendedExportConfig = {
                ...exportConfig,
                timeout: defaultTimeout,
            };

            const expectedDefinition = defWithExecConfig(
                createExportExecutionDefinition(
                    geoInsight,
                    projectId,
                    createRawExportExecutionDefinition(projectId, baseInsight),
                ),
                executionConfig,
            );

            await expectSaga(onExportResult, exportResultAction(exportConfig), vi.fn())
                .withState({})
                .provide([
                    [call(getId), "export-id"],
                    [call(getTime), startTime],
                    [select(getProjectId), projectId],
                    [select(exportResultTimeout), defaultTimeout],
                    [select(getIsEmbedded), false],
                    [select(getInsightWithBucketsViaMd), baseInsight],
                    [select(getFeatureFlags), { enableConditionalFormatting: false }],
                    [select(getCatalogItems), []],
                    [select(getExecutionConfig), executionConfig],
                    [matchers.call.fn(performPreparedInsightExport), exportResult],
                    [matchers.call.fn(downloadFile), undefined],
                    [call(getDuration, startTime), duration],
                    [matchers.call.fn(logExportResult), undefined],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .call(performPreparedInsightExport, projectId, expectedDefinition, exportConfigWithTimeout)
                .run();
        });
    });
});
