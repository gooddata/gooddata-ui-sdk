// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import forEach = require("lodash/forEach");
import { InjectedIntl } from "react-intl";

import * as BucketNames from "../../../constants/bucketNames";
import { IExtendedReferencePoint, IBucket, IUiConfig, IBucketUiConfig } from "../../interfaces/Visualization";

import { UICONFIG, RECOMMENDATIONS, OPEN_AS_REPORT, SUPPORTED } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import {
    comparisonAndTrendingRecommendationEnabled,
    overTimeComparisonRecommendationEnabled,
    hasNoStacks,
    hasNoMeasures,
    hasMoreThanOneMasterMeasure,
    percentRecommendationEnabled,
    previousPeriodRecommendationEnabled,
} from "./../bucketRules";

import { setBucketTitles } from "./../bucketHelper";
import { getTranslation } from "./../translations";
import { hasColorMapping } from "./../propertiesHelper";

import * as columnMeasuresIcon from "../../assets/column/bucket-title-measures.svg";
import * as columnViewIcon from "../../assets/column/bucket-title-view.svg";
import * as columnStackIcon from "../../assets/column/bucket-title-stack.svg";

import * as barMeasuresIcon from "../../assets/bar/bucket-title-measures.svg";
import * as barViewIcon from "../../assets/bar/bucket-title-view.svg";
import * as barStackIcon from "../../assets/bar/bucket-title-stack.svg";
import { VisualizationTypes } from "../../../constants/visualizationTypes";

function setBaseChartBucketWarningMessages(
    referencePoint: IExtendedReferencePoint,
    intl?: InjectedIntl,
): IUiConfig {
    const buckets: IBucket[] = get(referencePoint, BUCKETS, []);
    const updatedUiConfig: IUiConfig = cloneDeep(get(referencePoint, UICONFIG));

    forEach(buckets, (bucket: IBucket) => {
        const localIdentifier: string = get(bucket, "localIdentifier", "");
        const bucketUiConfig: IBucketUiConfig = get(updatedUiConfig, [BUCKETS, localIdentifier]);

        // skip disabled buckets
        if (!get(bucketUiConfig, "enabled", false)) {
            return;
        }

        if (!get(bucketUiConfig, "canAddItems")) {
            let warningMessageId;
            if (bucket.localIdentifier === BucketNames.MEASURES) {
                warningMessageId = "dashboard.bucket.metric_stack_by_warning";
            } else if (bucket.localIdentifier === BucketNames.STACK) {
                warningMessageId = "dashboard.bucket.category_stack_by_warning";
            }

            if (warningMessageId) {
                const warningMessage = getTranslation(warningMessageId, intl);
                set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
            }
        }
    });

    return updatedUiConfig;
}

export function setBaseChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: InjectedIntl,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets: IBucket[] = get(referencePointConfigured, BUCKETS, []);

    const measuresCanAddItems = hasNoMeasures(buckets) || hasNoStacks(buckets);
    const stackCanAddItems = !hasMoreThanOneMasterMeasure(buckets, BucketNames.MEASURES);

    set(referencePointConfigured, [UICONFIG], setBucketTitles(referencePoint, visualizationType, intl));
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        measuresCanAddItems,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], true);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "canAddItems"], stackCanAddItems);
    set(
        referencePointConfigured,
        [UICONFIG, OPEN_AS_REPORT, SUPPORTED],
        !hasColorMapping(referencePointConfigured.properties),
    );

    const iconsMap = {
        column: {
            [BucketNames.MEASURES]: columnMeasuresIcon,
            [BucketNames.VIEW]: columnViewIcon,
            [BucketNames.STACK]: columnStackIcon,
        },
        bar: {
            [BucketNames.MEASURES]: barMeasuresIcon,
            [BucketNames.VIEW]: barViewIcon,
            [BucketNames.STACK]: barStackIcon,
        },
    };

    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"],
        get(iconsMap, [visualizationType, BucketNames.MEASURES]),
    );
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"],
        get(iconsMap, [visualizationType, BucketNames.VIEW]),
    );
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.STACK, "icon"],
        get(iconsMap, [visualizationType, BucketNames.STACK]),
    );

    set(
        referencePointConfigured,
        UICONFIG,
        setBaseChartBucketWarningMessages(referencePointConfigured, intl),
    );

    return referencePointConfigured;
}

export function setBaseChartUiConfigRecommendations(
    referencePoint: IExtendedReferencePoint,
    visualizationType: string,
): IExtendedReferencePoint {
    // Recommendations
    if (visualizationType === VisualizationTypes.COLUMN) {
        const newReferencePoint = cloneDeep(referencePoint);
        const buckets = get(newReferencePoint, BUCKETS);

        const percentEnabled = percentRecommendationEnabled(buckets);
        const comparisonAndTrending = comparisonAndTrendingRecommendationEnabled(buckets);
        const overTimeComparison = overTimeComparisonRecommendationEnabled(newReferencePoint);
        const previousPeriod = previousPeriodRecommendationEnabled(buckets);

        set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "percent"], percentEnabled);
        set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "comparison"], comparisonAndTrending);
        set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "trending"], comparisonAndTrending);
        set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "overTimeComparison"], overTimeComparison);
        set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "previousPeriod"], previousPeriod);

        return newReferencePoint;
    }
    return referencePoint;
}
