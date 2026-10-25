// (C) 2007-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { createSelector } from "reselect";

import { getBucketsState } from "../store/buckets/buckets_selectors.js";
import { areBucketsEmpty } from "../store/buckets/helpers/bucket_item_predicates.js";
import { getFilterItems, getParameterFilters } from "../store/filter_bar/filter_bar_selector.js";
import { getInsightTitle } from "../store/insight/insight_selectors.js";
import { type IAppState } from "../store/types.js";
import { getDefaultVisualizationClass } from "../store/visualization_classes/visualization_classes_helpers.js";
import {
    getVisualizationClassState,
    getVisualizationClassesState,
} from "../store/visualization_classes/visualization_classes_selectors.js";

import { isReportNotFoundSelector } from "./report_selector.js";

function hasNoName(state: IAppState) {
    return getInsightTitle(state) === "";
}

export function isDefaultVisualizationClass(state: IAppState) {
    // Deep equality, not identity: the external writers re-derive this value, so the stored class
    // and the computed default are not guaranteed to share a reference. Both sides are normalized
    // to undefined first, because with no classes loaded the stored leaf is null while the computed
    // default is undefined, and `isEqual(null, undefined)` is FALSE — comparing them raw would
    // report "not the default" for a state that has no class to select at all.
    return isEqual(
        getVisualizationClassState(state) ?? undefined,
        getDefaultVisualizationClass(getVisualizationClassesState(state)) ?? undefined,
    );
}

export const isResetDisabledSelector = createSelector(
    hasNoName,
    isDefaultVisualizationClass,
    (state) => areBucketsEmpty(getBucketsState(state)),
    getFilterItems,
    getParameterFilters,
    isReportNotFoundSelector,

    (
        isNotNamedReport,
        isVisualizationClassDefault,
        noBucketsItemsLeft,
        filterItems,
        parameterFilters,
        isReportNotFound,
    ) => {
        const isEmptyFilterBar = filterItems.length === 0 && parameterFilters.length === 0;
        return (
            !isReportNotFound &&
            isNotNamedReport &&
            isVisualizationClassDefault &&
            noBucketsItemsLeft &&
            isEmptyFilterBar
        );
    },
);

export const isClearInsightContentDisabledSelector = createSelector(
    (state) => areBucketsEmpty(getBucketsState(state)),
    getFilterItems,
    getParameterFilters,
    isReportNotFoundSelector,

    (noBucketsItemsLeft, filterItems, parameterFilters, isReportNotFound) => {
        return (
            !isReportNotFound &&
            noBucketsItemsLeft &&
            filterItems.length === 0 &&
            parameterFilters.length === 0
        );
    },
);
