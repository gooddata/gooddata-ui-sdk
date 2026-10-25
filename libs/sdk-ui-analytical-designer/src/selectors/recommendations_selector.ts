// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getGeoLabelTypeFromVisualization } from "../constants/geo.js";
import { isPoPAvailable } from "../selectors/date_filter_selector.js";
import { getVisualizationClassTypeFromState } from "../services/visualization_class_service.js";
import { getAvailableAttributes } from "../store/catalog/catalog_selector.js";
import { getAvailableDateDatasets } from "../store/date_datasets/date_datasets_selectors.js";
import { isMultiline } from "../store/filter_bar/filter_bar_selector.js";
import {
    isFilteringRecommended,
    isGeoSegmentConflictRecommended as isGeoSegmentConflictRecommendedFlag,
} from "../store/properties/properties_selectors.js";
import { getDismissedRecommendations } from "../store/recommendations/recommendations_selector.js";
import {
    getUiConfigRecommendation,
    isFilteringRecommendationSupported,
} from "../store/reference_point/extended_reference_point_selectors.js";
import { getShortcutDateDatasetsError } from "../store/shortcuts/shortcut_date_datasets_selectors.js";
import { type IAppState } from "../store/types.js";

import { enableGeoSegmentConflictRecommendation } from "./feature_flag_selector.js";
import { isReportValid } from "./report_selector.js";

export const isRecommendationComparisonWithPeriodEnabledSelector = (state: IAppState) =>
    getUiConfigRecommendation(state, "previousPeriod");

const hasShortcutDatasetsErrorSelector = (state: IAppState) => !!getShortcutDateDatasetsError(state);

export const displayRecommendationComparisonWithPeriodSelector = createSelector(
    isRecommendationComparisonWithPeriodEnabledSelector,
    getAvailableDateDatasets,
    hasShortcutDatasetsErrorSelector,

    // `.length`, not `.size`: `.size` on a plain array is undefined and `undefined > 0` would
    // silently hide the recommendation
    (isRecommendationComparisonWithPeriodEnabled, availableDateDatasets, hasShortcutDatasetsError) => {
        const availableDatasets = availableDateDatasets.length > 0;
        return !hasShortcutDatasetsError && isRecommendationComparisonWithPeriodEnabled && availableDatasets;
    },
);

export const displayRecommendationContributionInPercentsSelector = (state: IAppState) =>
    getUiConfigRecommendation(state, "percent");

export const isDisplayRecommendationsMetricWithPeriodSelector = (state: IAppState) =>
    getUiConfigRecommendation(state, "overTimeComparison");

export const displayRecommendationsMetricWithPeriodSelector = createSelector(
    isDisplayRecommendationsMetricWithPeriodSelector,
    isPoPAvailable,
    (isDisplayRecommendationsMetricWithPeriodEnabled, popIsAvailable: boolean) => {
        return isDisplayRecommendationsMetricWithPeriodEnabled && popIsAvailable;
    },
);

export const isRecommendationTrendingEnabledSelector = (state: IAppState) =>
    getUiConfigRecommendation(state, "trending");

export const displayRecommendationsTrendingSelector = createSelector(
    isRecommendationTrendingEnabledSelector,
    getAvailableDateDatasets,
    hasShortcutDatasetsErrorSelector,

    (isRecommendationTrendingEnabled, availableDateDatasets, hasShortcutDatasetsError) => {
        const availableDatasets = availableDateDatasets.length > 0;
        return !hasShortcutDatasetsError && isRecommendationTrendingEnabled && availableDatasets;
    },
);

export const isRecommendationComparisonEnabledSelector = (state: IAppState) =>
    getUiConfigRecommendation(state, "comparison");

export const displayRecommendationComparisonSelector = createSelector(
    isRecommendationComparisonEnabledSelector,
    getAvailableAttributes,

    (isRecommendationComparisonEnabled, availableAttributes) => {
        return isRecommendationComparisonEnabled && availableAttributes.length > 0;
    },
);

export const isGeoSegmentConflictRecommendedSelector = createSelector(
    isGeoSegmentConflictRecommendedFlag,
    enableGeoSegmentConflictRecommendation,
    getVisualizationClassTypeFromState,
    (isGeoSegmentConflictRecommended, isGeoSegmentConflictRecommendationEnabled, visualizationType) =>
        isGeoSegmentConflictRecommended &&
        isGeoSegmentConflictRecommendationEnabled &&
        Boolean(getGeoLabelTypeFromVisualization(visualizationType)),
);

export const displayRecommendationFilteringSelector = (state: IAppState) =>
    (isFilteringRecommended(state) || isGeoSegmentConflictRecommendedSelector(state)) &&
    isFilteringRecommendationSupported(state);

export const isRecommendationDismissedForVisClass = createSelector(
    getDismissedRecommendations,
    getVisualizationClassTypeFromState,
    (dismissedRecommendations, visClass) => {
        return dismissedRecommendations.includes(visClass);
    },
);

export const displayRecommendationBlockSelector = createSelector(
    displayRecommendationComparisonWithPeriodSelector,
    displayRecommendationContributionInPercentsSelector,
    displayRecommendationsMetricWithPeriodSelector,
    displayRecommendationsTrendingSelector,
    displayRecommendationComparisonSelector,
    displayRecommendationFilteringSelector,
    isReportValid,
    isMultiline,
    isRecommendationDismissedForVisClass,
    (
        displayComparisonWithPeriod,
        displayContributionInPercents,
        displayMetricWithPeriod,
        displayTrending,
        displayComparison,
        displayFiltering,
        isValid,
        isMultiline,
        isDismissed,
    ) =>
        (displayComparisonWithPeriod ||
            displayContributionInPercents ||
            displayMetricWithPeriod ||
            displayTrending ||
            displayComparison ||
            /**
             * Filtering recommendation is displayed only when it is recommended and not dismissed
             */
            (displayFiltering && !isDismissed)) &&
        isValid &&
        !isMultiline,
);
