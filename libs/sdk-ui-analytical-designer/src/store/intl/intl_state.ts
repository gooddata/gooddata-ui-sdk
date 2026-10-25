// (C) 2026 GoodData Corporation

import { type ITranslations } from "@gooddata/sdk-ui";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../utils/translations.js";

/**
 * appState.intl slice state.
 *
 * `locale` deliberately stays a plain string: SET_LOCALE stores the payload verbatim and readers
 * re-validate on the way out (selectors/intl_selector.ts resolves message lookups through
 * validateLocale). Only the BOOTSTRAP_DATA write validates the incoming user language.
 *
 * `messages` maps a loaded locale to its translation bundle; the default bundle ships in the initial
 * state.
 */
export interface IIntlState {
    locale: string;
    messages: Record<string, ITranslations>;
}

export const intlInitialState: IIntlState = {
    locale: DEFAULT_LANGUAGE,
    messages: DEFAULT_MESSAGES,
};
