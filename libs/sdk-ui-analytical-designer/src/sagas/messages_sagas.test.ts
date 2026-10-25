// (C) 2020-2026 GoodData Corporation

// @vitest-environment node

import { expectSaga } from "redux-saga-test-plan";
import { delay, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { DataTooLargeError } from "@gooddata/sdk-backend-spi";
import { type IExtendedExportConfig } from "@gooddata/sdk-ui";

import { exportResultError } from "../actions/export_report_actions.js";
import { addMessage, hideMessage } from "../actions/messages_actions.js";
import { getLocale } from "../selectors/intl_selector.js";
import { MESSAGE_EXPORT_RESULT_ERROR } from "../store/messages/messages_state.js";

import { messagesWatcher } from "./messages_sagas.js";

describe("messages", () => {
    it("add message with duration will be hide after defined time", async () => {
        const { effects } = await expectSaga(messagesWatcher)
            .provide([[delay(3000), true]])
            .dispatch(
                addMessage({
                    type: "success",
                    translationKey: "translationKey",
                    durationInMs: 3000,
                }),
            )
            .silentRun();

        expect(effects.put).toEqual([put(hideMessage("translationKey"))]);
    });

    it("add message do nothing without duration parameter", async () => {
        const { effects } = await expectSaga(messagesWatcher)
            .dispatch(
                addMessage({
                    type: "success",
                    translationKey: "translationKey",
                }),
            )
            .silentRun();

        expect(effects.put).not.toBeDefined();
    });

    it("hides an explicit-id message by its id, not the translation key", async () => {
        const { effects } = await expectSaga(messagesWatcher)
            .provide([[delay(3000), true]])
            .dispatch(
                addMessage({
                    type: "error",
                    translationKey: "translationKey",
                    id: "explicit_id",
                    durationInMs: 3000,
                }),
            )
            .silentRun();

        expect(effects.put).toEqual([put(hideMessage("explicit_id"))]);
    });

    describe("export result too-many-rows toast", () => {
        const exportConfig = { title: "Export", format: "csv" } as IExtendedExportConfig;
        const exportErrorAction = (error: Error) =>
            exportResultError("id-1", "project-1", 1551090435592, 20, error, exportConfig);

        it("formats the row counts with the user locale and adds the toast under the export error id", async () => {
            const error = new DataTooLargeError("too large", undefined, {
                structuredDetail: {
                    limitBreaks: [{ limitType: "export-rows", limit: 1000, actualValue: 1500 }],
                },
            });

            const { effects } = await expectSaga(messagesWatcher)
                .provide([[select(getLocale), "en-US"]])
                .dispatch(exportErrorAction(error))
                .silentRun();

            expect(effects.put).toEqual([
                put(
                    addMessage({
                        id: MESSAGE_EXPORT_RESULT_ERROR,
                        translationKey: "messages.exportResultError.tooManyRows",
                        type: "error",
                        values: { actual: "1,500", limit: "1,000" },
                    }),
                ),
            ]);
        });

        it("does nothing for export errors without an export-rows limit break", async () => {
            const { effects } = await expectSaga(messagesWatcher)
                .dispatch(exportErrorAction(new Error("boom")))
                .silentRun();

            expect(effects.put).not.toBeDefined();
        });
    });
});
