// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { areBucketsEmpty } from "../store/buckets/helpers/bucket_item_predicates.js";
import {
    isReportOpening as isReportOpeningState,
    isReportSaving as isReportSavingState,
} from "../store/report/report_selectors.js";
import { type IAppState } from "../store/types.js";

import { getDecoratedBuckets } from "./buckets_selector.js";
import {
    hasNegativeValueSelector,
    hasReportLoadingError,
    isExecutionRunningSelector,
    isInvalidConfigurationSelector,
    isProtectedReportSelector,
    isReportEmptySelector,
    isReportTooLargeSelector,
} from "./report_selector.js";
import { isReportInvalidSelector } from "./save_report_selector.js";

export function hasExportErrorExceptTooLarge(state: IAppState) {
    return (
        isInvalidConfigurationSelector(state) ||
        hasNegativeValueSelector(state) ||
        isReportEmptySelector(state) ||
        isReportInvalidSelector(state) ||
        isExecutionRunningSelector(state) ||
        isProtectedReportSelector(state)
    );
}

export function hasReportError(state: IAppState) {
    return (
        isInvalidConfigurationSelector(state) ||
        hasNegativeValueSelector(state) ||
        isReportEmptySelector(state) ||
        isReportInvalidSelector(state) ||
        isReportTooLargeSelector(state) ||
        isExecutionRunningSelector(state) ||
        isProtectedReportSelector(state) ||
        hasReportLoadingError(state)
    );
}

export const getIsReportEmpty = createSelector(getDecoratedBuckets, (decoratedBuckets) => {
    return areBucketsEmpty(decoratedBuckets);
});

export function isReportSaving(state: IAppState): boolean {
    return isReportSavingState(state);
}

export function isReportOpening(state: IAppState): boolean {
    return isReportOpeningState(state);
}
