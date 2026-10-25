// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call, select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { type IBootstrapData, bootstrapData, setIntlMessages } from "../../actions/app_context_actions.js";
import { bootstrapData as bootstrapDataSelector, userLanguage } from "../../selectors/bootstrap_selector.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES, resolveMessages } from "../../utils/translations.js";

import { watchApplicationContext } from "./application_context_saga.js";

describe("watchApplicationContext", () => {
    const ruMessages = { "save.button": "Сохранить" };

    describe("with bootstrap data seeded before the sagas start", () => {
        it("loads the seeded workspace locale on start, without a BOOTSTRAP_DATA dispatch", () => {
            return (
                expectSaga(watchApplicationContext)
                    .provide([
                        [select(bootstrapDataSelector), { user: {} } as IBootstrapData],
                        [select(userLanguage), "ru-RU"],
                        [call(resolveMessages, "ru-RU"), ruMessages],
                    ])
                    // Deliberately no .dispatch(bootstrapData(...)): the host wrapper
                    // dispatches BOOTSTRAP_DATA before the saga runtime starts, so the
                    // locale must be applied from the seeded context when the watcher boots.
                    .put(setIntlMessages("ru-RU", ruMessages))
                    .silentRun(0)
            );
        });

        it("falls back to the default locale when the seeded language is unsupported", () => {
            return expectSaga(watchApplicationContext)
                .provide([
                    [select(bootstrapDataSelector), { user: {} } as IBootstrapData],
                    [select(userLanguage), "en-EN"],
                    [call(resolveMessages, "en-US"), { "save.button": "Save" }],
                ])
                .put(setIntlMessages("en-US", { "save.button": "Save" }))
                .silentRun(0);
        });
    });

    describe("without seeded bootstrap data", () => {
        it("loads the locale in reaction to BOOTSTRAP_DATA", () => {
            return expectSaga(watchApplicationContext)
                .provide([
                    [select(bootstrapDataSelector), null],
                    [call(resolveMessages, "ru-RU"), ruMessages],
                ])
                .dispatch(bootstrapData({ user: { language: "ru-RU" } } as IBootstrapData))
                .put(setIntlMessages("ru-RU", ruMessages))
                .silentRun(0);
        });

        it("falls back to default messages when loading the locale chunk fails", () => {
            return expectSaga(watchApplicationContext)
                .provide([
                    [select(bootstrapDataSelector), null],
                    [call(resolveMessages, "ru-RU"), throwError(new Error("chunk load failed"))],
                ])
                .dispatch(bootstrapData({ user: { language: "ru-RU" } } as IBootstrapData))
                .put(setIntlMessages("ru-RU", DEFAULT_MESSAGES[DEFAULT_LANGUAGE]))
                .silentRun(0);
        });
    });
});
