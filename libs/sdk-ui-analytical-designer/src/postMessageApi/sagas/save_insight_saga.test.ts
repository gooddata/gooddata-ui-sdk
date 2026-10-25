// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { describe, it } from "vitest";

import {
    type AdSaveAsInsightCommandData,
    type AdSaveInsightCommandData,
    GdcAdCommandType,
    GdcErrorType,
    GdcProductName,
    type IAdSaveAsInsightCommandBody,
    type IAdSaveCommandBody,
} from "@gooddata/sdk-embedding";

import { reportTitleChange } from "../../actions/report_actions.js";
import { saveReportRequested } from "../../actions/save_actions.js";
import { isReportSavedSelector } from "../../selectors/report_selector.js";
import { isSaveAsNewDisabledSelector } from "../../selectors/save_report_selector.js";
import { saveAsInsightRequested } from "../actions/save_as_insight_actions.js";
import { saveInsightFailed, saveInsightRequested } from "../actions/save_insight_actions.js";

import { handleSaveAsInsightRequested, handleSaveInsightRequested } from "./save_insight_saga.js";

describe("Save Insight saga", () => {
    const title = "abc";
    const contextId = "contextId";

    const getSaveInsightCommandData = (
        commandBody: IAdSaveCommandBody,
        contextId?: string,
    ): AdSaveInsightCommandData => {
        return {
            gdc: {
                product: GdcProductName.ANALYTICAL_DESIGNER,
                event: {
                    name: GdcAdCommandType.Save,
                    data: commandBody,
                    contextId,
                },
            },
        };
    };

    const getSaveAsInsightCommandData = (
        commandBody: IAdSaveAsInsightCommandBody,
        contextId?: string,
    ): AdSaveAsInsightCommandData => {
        return {
            gdc: {
                product: GdcProductName.ANALYTICAL_DESIGNER,
                event: {
                    name: GdcAdCommandType.SaveAs,
                    data: commandBody,
                    contextId,
                },
            },
        };
    };

    it("should save insight with config title", () => {
        const commandBody: IAdSaveCommandBody = { title };

        return expectSaga(
            handleSaveInsightRequested,
            saveInsightRequested(getSaveInsightCommandData(commandBody, contextId)),
        )
            .provide([
                [select(isSaveAsNewDisabledSelector), false],
                [select(isReportSavedSelector), false],
            ])
            .put(reportTitleChange(title))
            .put(saveReportRequested(false, false, contextId))
            .run();
    });

    it("should dispatch a saveInsightFailed action when insight is empty or saving", () => {
        const commandBody: IAdSaveCommandBody = { title };
        return expectSaga(
            handleSaveInsightRequested,
            saveInsightRequested(getSaveInsightCommandData(commandBody, contextId)),
        )
            .provide([
                [select(isSaveAsNewDisabledSelector), true],
                [select(isReportSavedSelector), false],
            ])
            .put(saveInsightFailed(false, undefined, contextId, GdcErrorType.InvalidState))
            .run();
    });

    it("should save as a new insight with config title", () => {
        const commandBody: IAdSaveAsInsightCommandBody = { title };

        return expectSaga(
            handleSaveAsInsightRequested,
            saveAsInsightRequested(getSaveAsInsightCommandData(commandBody, contextId)),
        )
            .provide([
                [select(isSaveAsNewDisabledSelector), false],
                [select(isReportSavedSelector), true],
            ])
            .put(reportTitleChange(title))
            .put(saveReportRequested(true, false, contextId))
            .run();
    });
});
