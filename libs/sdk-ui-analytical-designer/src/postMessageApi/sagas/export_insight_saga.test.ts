// (C) 2007-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import {
    type AdExportInsightCommandData,
    GdcAdCommandType,
    GdcErrorType,
    GdcProductName,
    type IAdExportInsightCommandBody,
    type IInsightExportConfig,
} from "@gooddata/sdk-embedding";

import { exportResult } from "../../actions/export_report_actions.js";
import { CSV, XLSX } from "../../constants/export_types.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import { getIsExportCSVDisabled, getIsExportXLSXDisabled } from "../../selectors/options_menu_selector.js";
import { VisualizationPropertiesSelectors } from "../../selectors/visualization_properties_selector.js";
import { exportInsightFailed, exportInsightRequested } from "../actions/export_insight_actions.js";

import { handleExportInsightRequest } from "./export_insight_saga.js";

describe("Save Insight saga", () => {
    const projectId = "projectId";
    const title = "abc";
    const format = XLSX;
    const contextId = "contextId";
    const config: IInsightExportConfig = {
        title,
        format,
    };
    const commandBody: IAdExportInsightCommandBody = {
        config,
    };

    const getExportInsightCommandData = (
        commandBody: IAdExportInsightCommandBody,
        contextId?: string,
    ): AdExportInsightCommandData => {
        const postMessageContext: { contextId: string } = {
            contextId,
        };
        return {
            gdc: {
                product: GdcProductName.ANALYTICAL_DESIGNER,
                event: {
                    name: GdcAdCommandType.Export,
                    data: commandBody,
                    ...postMessageContext,
                },
            },
        };
    };

    it("should export insight with export config", async () => {
        const saga: RunResult = await expectSaga(
            handleExportInsightRequest,
            exportInsightRequested(getExportInsightCommandData(commandBody, contextId)),
        )
            .provide([
                [select(getProjectId), projectId],
                [select(getIsExportXLSXDisabled), false],
                [select(getIsExportCSVDisabled), false],
                [select(VisualizationPropertiesSelectors.getGrandTotalsPosition), undefined],
            ])
            .run();
        expect(saga.effects.put).toEqual([put(exportResult(config, contextId))]);
    });

    it("should fallback to current insight grand totals position when exporting", async () => {
        const saga: RunResult = await expectSaga(
            handleExportInsightRequest,
            exportInsightRequested(getExportInsightCommandData(commandBody, contextId)),
        )
            .provide([
                [select(getProjectId), projectId],
                [select(getIsExportXLSXDisabled), false],
                [select(getIsExportCSVDisabled), false],
                [select(VisualizationPropertiesSelectors.getGrandTotalsPosition), "pinnedTop"],
            ])
            .run();
        expect(saga.effects.put).toEqual([
            put(exportResult({ ...config, grandTotalsPosition: "pinnedTop" }, contextId)),
        ]);
    });

    it("should preserve CSV delimiter when exporting via postMessage", async () => {
        const csvConfig: IInsightExportConfig & { delimiter?: string } = {
            title,
            format: CSV,
            delimiter: ";",
        };
        const saga: RunResult = await expectSaga(
            handleExportInsightRequest,
            exportInsightRequested(
                getExportInsightCommandData(
                    {
                        config: csvConfig,
                    },
                    contextId,
                ),
            ),
        )
            .provide([
                [select(getProjectId), projectId],
                [select(getIsExportXLSXDisabled), false],
                [select(getIsExportCSVDisabled), false],
                [select(VisualizationPropertiesSelectors.getGrandTotalsPosition), undefined],
            ])
            .run();
        expect(saga.effects.put).toEqual([put(exportResult(csvConfig, contextId))]);
    });

    it("should dispatch exportInsightFailed action when export to XLSX is disabled", async () => {
        const saga: RunResult = await expectSaga(
            handleExportInsightRequest,
            exportInsightRequested(getExportInsightCommandData(commandBody, contextId)),
        )
            .provide([
                [select(getProjectId), projectId],
                [select(getIsExportXLSXDisabled), true],
                [select(getIsExportCSVDisabled), false],
            ])
            .run();
        expect(saga.effects.put).toEqual([
            put(
                exportInsightFailed({
                    projectId,
                    contextId,
                    exportConfig: config,
                    errorCode: GdcErrorType.InvalidState,
                    errorMessage: "The app is not in a state to export to xlsx",
                }),
            ),
        ]);
    });

    it("should dispatch exportInsightFailed action when export to CSV is disabled", async () => {
        const commandBody: IAdExportInsightCommandBody = {
            config: {
                title,
                format: CSV,
            },
        };
        const saga: RunResult = await expectSaga(
            handleExportInsightRequest,
            exportInsightRequested(getExportInsightCommandData(commandBody, contextId)),
        )
            .provide([
                [select(getProjectId), projectId],
                [select(getIsExportXLSXDisabled), false],
                [select(getIsExportCSVDisabled), true],
            ])
            .run();
        expect(saga.effects.put).toEqual([
            put(
                exportInsightFailed({
                    projectId,
                    contextId,
                    exportConfig: commandBody.config,
                    errorCode: GdcErrorType.InvalidState,
                    errorMessage: "The app is not in a state to export to csv",
                }),
            ),
        ]);
    });
});
