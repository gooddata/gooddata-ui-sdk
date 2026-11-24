// (C) 2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type EmptyDateValuesFilterMode } from "../store/filter_bar/filter_bar_types.js";

/**
 * Words the empty date values mode into a date filter title, the same on the filter bar's button and the
 * metric date filter: "Empty values" for only, "All time except Empty values" for exclude on All time,
 * "<period>, empty values" for include with a period. Other combinations are the default for the period,
 * so the period title is returned unchanged.
 *
 * @param periodTitle - the formatted period, e.g. "Last 4 quarters"
 * @param isAllTime - whether the period is All time
 * @param mode - the empty date values mode
 * @param intl - AD intl, which holds the empty values translations
 */
export function getPeriodTitleWithEmptyValues(
    periodTitle: string,
    isAllTime: boolean,
    mode: EmptyDateValuesFilterMode | undefined,
    intl: IntlShape,
): string {
    const emptyValuesLabel = () => intl.formatMessage({ id: "filter.date.additional_filter.empty_values" });
    if (mode === "only") {
        return emptyValuesLabel();
    }
    if (mode === "exclude" && isAllTime) {
        return `${periodTitle} ${intl.formatMessage({ id: "gs.list.except" })} ${emptyValuesLabel()}`;
    }
    if (mode === "include" && !isAllTime) {
        return intl.formatMessage({ id: "filter.date.empty_values.include.title" }, { title: periodTitle });
    }
    return periodTitle;
}
