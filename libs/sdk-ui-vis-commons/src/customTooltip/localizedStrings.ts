// (C) 2026 GoodData Corporation

import { type IntlShape, defineMessages } from "react-intl";

import { type ITooltipLocalizedStrings } from "./types.js";

const messages = defineMessages({
    noFetch: { id: "richText.no_fetch" },
    noData: { id: "richText.no_data" },
    multipleItems: { id: "richText.multiple_data" },
});

/**
 * Builds the localized placeholder strings for the non-value reference states,
 * shared by every tooltip consumer (Highcharts, geo) so the wording and the
 * message ids live in one place. `intl` is optional — the Highcharts tooltip
 * formatter receives it optionally — and falls back to English.
 *
 * @internal
 */
export function buildTooltipLocalizedStrings(intl?: IntlShape): ITooltipLocalizedStrings {
    return {
        noFetch: intl ? `(${intl.formatMessage(messages.noFetch)})` : "(Data could not be retrieved)",
        noData: intl ? `(${intl.formatMessage(messages.noData)})` : "(No data)",
        multipleItems: intl ? `(${intl.formatMessage(messages.multipleItems)})` : "(Multiple items)",
    };
}
