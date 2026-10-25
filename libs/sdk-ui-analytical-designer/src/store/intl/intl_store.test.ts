// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { setIntlMessages, setLocale } from "../../actions/app_context_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { getIntlMessagesForLocale, getLocale } from "../../selectors/intl_selector.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../utils/translations.js";

import { getIntlState } from "./intl_selectors.js";

describe("intl store", () => {
    it("self-initializes with the default language and bundled messages", () => {
        const state = combinedRootReducer(initialState, { type: "@@INIT" });

        expect(getLocale(state)).toBe(DEFAULT_LANGUAGE);
        expect(getIntlState(state).messages).toBe(DEFAULT_MESSAGES);
    });

    it("serves the initial state through the selector before the slice ever reduced", () => {
        expect(getLocale(initialState)).toBe(DEFAULT_LANGUAGE);
        expect(getIntlMessagesForLocale(initialState)).toBe(DEFAULT_MESSAGES[DEFAULT_LANGUAGE]);
    });

    it("stores the validated locale of BOOTSTRAP_DATA", () => {
        const state = combinedRootReducer(getInitializedState(), {
            type: ActionTypeKeys.BOOTSTRAP_DATA,
            payload: { data: { user: { language: "de-DE" } }, windowInfo: {} },
        } as { type: string });

        expect(getLocale(state)).toBe("de-DE");
    });

    it("falls back to the default language when the bootstrap language is unsupported", () => {
        const state = combinedRootReducer(getInitializedState(), {
            type: ActionTypeKeys.BOOTSTRAP_DATA,
            payload: { data: { user: { language: "xx-XX" } }, windowInfo: {} },
        } as { type: string });

        expect(getLocale(state)).toBe(DEFAULT_LANGUAGE);
    });

    it("SET_LOCALE stores the locale verbatim, without validation on write", () => {
        const state = combinedRootReducer(getInitializedState(), setLocale("xx-XX"));

        expect(getLocale(state)).toBe("xx-XX");
        // ...but message resolution re-validates, so the lookup still lands on the default
        expect(getIntlMessagesForLocale(state)).toBe(DEFAULT_MESSAGES[DEFAULT_LANGUAGE]);
    });

    it("SET_INTL_MESSAGES merges the bundle without dropping other locales", () => {
        const german = { "some.key": "german" };
        const french = { "some.key": "french" };

        const withGerman = combinedRootReducer(getInitializedState(), setIntlMessages("de-DE", german));
        const withBoth = combinedRootReducer(withGerman, setIntlMessages("fr-FR", french));

        const { messages } = getIntlState(withBoth);
        expect(messages["de-DE"]).toEqual(german);
        expect(messages["fr-FR"]).toEqual(french);
        expect(messages[DEFAULT_LANGUAGE]).toBe(DEFAULT_MESSAGES[DEFAULT_LANGUAGE]);
    });

    it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
        const state = getInitializedState();

        expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
});
