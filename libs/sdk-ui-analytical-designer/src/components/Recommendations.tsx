// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type ObjRef } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";

import {
    GRANULARITY_OPTIONS,
    type Granularity,
    isFiscalGranularity,
    isStandardGranularity,
} from "../models/granularity.js";
import { getActiveCalendars } from "../selectors/feature_flag_selector.js";
import {
    displayRecommendationBlockSelector,
    displayRecommendationComparisonSelector,
    displayRecommendationComparisonWithPeriodSelector,
    displayRecommendationContributionInPercentsSelector,
    displayRecommendationFilteringSelector,
    displayRecommendationsMetricWithPeriodSelector,
    displayRecommendationsTrendingSelector,
    isGeoSegmentConflictRecommendedSelector,
    isRecommendationDismissedForVisClass,
} from "../selectors/recommendations_selector.js";
import { getVisualizationClassTypeFromState } from "../services/visualization_class_service.js";
import { getAvailableAttributes } from "../store/catalog/catalog_selector.js";
import {
    applyComparison,
    applyComparisonWithPeriod,
    applyContributionInPercents,
    applyFiltering,
    applyMetricWithPeriod,
    applyTrending,
    dismissRecommendations,
} from "../store/recommendations/recommendations_actions.js";
import { type AppDispatch } from "../store/types.js";

import { RecommendationComparison } from "./recommendations/RecommendationComparison.js";
import { RecommendationComparisonWithPeriod } from "./recommendations/RecommendationComparisonWithPeriod.js";
import { RecommendationContributionInPercents } from "./recommendations/RecommendationContributionInPercents.js";
import {
    RecommendationFiltering,
    type RecommendationFilteringVariant,
} from "./recommendations/RecommendationFiltering.js";
import { RecommendationMetricWithPeriod } from "./recommendations/RecommendationMetricWithPeriod.js";
import { RecommendationTrending } from "./recommendations/RecommendationTrending.js";

export function Recommendations() {
    const dispatch = useDispatch<AppDispatch>();

    const displayRecommendationBlock = useSelector(displayRecommendationBlockSelector);
    const displayContributionInPercents = useSelector(displayRecommendationContributionInPercentsSelector);
    const displayMetricWithPeriod = useSelector(displayRecommendationsMetricWithPeriodSelector);
    const displayComparisonWithPeriod = useSelector(displayRecommendationComparisonWithPeriodSelector);
    const displayTrending = useSelector(displayRecommendationsTrendingSelector);
    const displayComparison = useSelector(displayRecommendationComparisonSelector);
    const displayFiltering = useSelector(displayRecommendationFilteringSelector);
    const isGeoSegmentConflictRecommended = useSelector(isGeoSegmentConflictRecommendedSelector);
    const isRecommendationsDismissed = useSelector(isRecommendationDismissedForVisClass);
    const availableAttributes = useSelector(getAvailableAttributes);
    const visualization = useSelector(getVisualizationClassTypeFromState);
    const activeCalendars = useSelector(getActiveCalendars);

    const filteringVariant: RecommendationFilteringVariant = isGeoSegmentConflictRecommended
        ? "geoSegmentConflict"
        : "default";

    const handleApplyComparisonWithPeriod = useCallback(
        (granularity: Granularity) => {
            dispatch(applyComparisonWithPeriod(granularity));
        },
        [dispatch],
    );
    const handleApplyContributionInPercents = useCallback(() => {
        dispatch(applyContributionInPercents());
    }, [dispatch]);
    const handleApplyMetricWithPeriod = useCallback(() => {
        dispatch(applyMetricWithPeriod());
    }, [dispatch]);
    const handleApplyTrending = useCallback(
        (granularity: Granularity) => {
            dispatch(applyTrending(granularity));
        },
        [dispatch],
    );
    const handleApplyComparison = useCallback(
        (attributeRef: ObjRef) => {
            dispatch(applyComparison(attributeRef));
        },
        [dispatch],
    );
    const handleApplyFiltering = useCallback(() => {
        dispatch(applyFiltering());
    }, [dispatch]);

    const fiscalActive = activeCalendars?.fiscal === true;
    const standardActive = activeCalendars?.standard !== false;
    const fiscalDefault = activeCalendars?.default === "FISCAL";

    const intl = useIntl();

    const filteredGranularityOptions = GRANULARITY_OPTIONS.filter((g) => {
        if (isFiscalGranularity(g.dateType)) return fiscalActive;
        if (isStandardGranularity(g.dateType)) return standardActive;
        return true;
    }).sort((a, b) => {
        // Put the default calendar granularities first
        const aIsDefault = fiscalDefault
            ? isFiscalGranularity(a.dateType)
            : isStandardGranularity(a.dateType);
        const bIsDefault = fiscalDefault
            ? isFiscalGranularity(b.dateType)
            : isStandardGranularity(b.dateType);
        if (aIsDefault === bIsDefault) return 0;
        return aIsDefault ? -1 : 1;
    });
    const getContributionInPercents = (show: boolean) => {
        return show && <RecommendationContributionInPercents onApply={handleApplyContributionInPercents} />;
    };

    const getMetricWithPeriod = (show: boolean) => {
        return show && <RecommendationMetricWithPeriod onApply={handleApplyMetricWithPeriod} />;
    };

    const getComparisonWithPeriod = (show: boolean) => {
        return (
            show && (
                <RecommendationComparisonWithPeriod
                    granularityOptions={filteredGranularityOptions}
                    onApply={handleApplyComparisonWithPeriod}
                />
            )
        );
    };

    const getTrending = (show: boolean) => {
        return (
            show && (
                <RecommendationTrending
                    granularityOptions={filteredGranularityOptions}
                    onApply={handleApplyTrending}
                />
            )
        );
    };

    const getComparison = (show: boolean) => {
        return (
            show && (
                <RecommendationComparison
                    availableAttributes={availableAttributes}
                    onApply={handleApplyComparison}
                />
            )
        );
    };

    const getFiltering = (show: boolean) => {
        return (
            show &&
            !isRecommendationsDismissed && (
                <RecommendationFiltering onApply={handleApplyFiltering} variant={filteringVariant} />
            )
        );
    };

    const renderTurnOffButton = () => {
        /**
         * We currently only allow to hide the block using the "filtering" recommendation.
         */
        return (
            displayFiltering &&
            !isRecommendationsDismissed && (
                <Button
                    className="gd-button-link-dimmed adi-recommendations-turn-off-button s-recommendations-turn-off"
                    tagName="a"
                    value={intl.formatMessage({ id: "dashboard.recommendation.turn_off" })}
                    onClick={() => dispatch(dismissRecommendations(visualization))}
                />
            )
        );
    };

    return (
        displayRecommendationBlock && (
            <div className="adi-recommendations-container s-adi-recommendations-container">
                <div className="adi-recommendations-title-wrapper">
                    <div className="adi-recommendations-title">
                        {intl.formatMessage({ id: "dashboard.recommendation.recommended_next_steps" })}
                    </div>
                    {renderTurnOffButton()}
                </div>
                {getFiltering(displayFiltering)}
                {getTrending(displayTrending)}
                {getComparison(displayComparison)}
                {getContributionInPercents(displayContributionInPercents)}
                {getComparisonWithPeriod(displayComparisonWithPeriod)}
                {getMetricWithPeriod(displayMetricWithPeriod)}
            </div>
        )
    );
}
