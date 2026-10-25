// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type ILocale } from "@gooddata/sdk-ui";

import { getIntlState } from "../store/intl/intl_selectors.js";
import { type IAppState } from "../store/types.js";
import { createIntl, validateLocale } from "../utils/translations.js";

export const getLocale = (state: IAppState): ILocale | undefined => getIntlState(state).locale as ILocale;
export const getIntlMessages = (state: IAppState): Record<string, Record<string, ILocale>> =>
    getIntlState(state).messages as unknown as Record<string, Record<string, ILocale>>;

// The store keeps the raw locale, but messages are loaded (and keyed) under the validated
// locale — unsupported locales fall back to en-US. Resolve the lookup the same way so an
// unsupported or not-yet-known locale never yields a permanently empty message map.
export const getIntlMessagesForLocale = createSelector(
    getLocale,
    getIntlMessages,
    (locale, messages) => messages[validateLocale(locale ?? "")],
);

export const getIntl = createSelector(getLocale, getIntlMessages, (locale, messages) => {
    const resolvedLocale = validateLocale(locale ?? "");
    return createIntl(resolvedLocale, messages[resolvedLocale]);
});
