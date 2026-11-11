// (C) 2019-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type BucketNameValues, BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { _cloneDeep, _set } from "@gooddata/util";

import { messages } from "../../../locales.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket.js";
import { OPEN_AS_REPORT, RECOMMENDATIONS, SUPPORTED, UICONFIG } from "../../constants/uiConfig.js";
import {
    type IBucketItem,
    type IBucketOfFun,
    type IExtendedReferencePoint,
    type IUiConfig,
} from "../../interfaces/Visualization.js";
import { getStackItems, isDateBucketItem, setBucketTitles } from "../bucketHelper.js";
import {
    comparisonAndTrendingRecommendationEnabled,
    hasMoreThanOneMasterMeasure,
    hasNoMeasures,
    hasNoStacksWithDate,
    overTimeComparisonRecommendationEnabled,
    percentRecommendationEnabled,
    previousPeriodRecommendationEnabled,
} from "../bucketRules.js";
import { hasColorMapping } from "../propertiesHelper.js";
import { getTranslation } from "../translations.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const columnMeasuresIcon = "local:column/bucket-title-measures.svg";
const columnViewIcon = "local:column/bucket-title-view.svg";
const columnStackIcon = "local:column/bucket-title-stack.svg";
const barMeasuresIcon = "local:bar/bucket-title-measures.svg";
const barViewIcon = "local:bar/bucket-title-view.svg";
const barStackIcon = "local:bar/bucket-title-stack.svg";

function setBaseChartBucketWarningMessages(
    referencePoint: IExtendedReferencePoint,
    intl?: IntlShape,
): IUiConfig | null | undefined {
    const buckets = referencePoint?.buckets ?? [];
    const updatedUiConfig = _cloneDeep(referencePoint?.uiConfig);
    const stackItems = getStackItems(buckets, [ATTRIBUTE, DATE]);

    if (!updatedUiConfig) {
        return updatedUiConfig;
    }

    buckets.forEach((bucket: IBucketOfFun) => {
        const localIdentifier = bucket?.localIdentifier ?? "";
        const bucketUiConfig = updatedUiConfig?.buckets?.[localIdentifier];

        // skip disabled buckets
        if (!bucketUiConfig?.enabled) {
            return;
        }

        if (!bucketUiConfig?.canAddItems) {
            let warningMessage;
            if (bucket.localIdentifier === BucketNames.MEASURES && intl) {
                warningMessage = getBucketItemsWarningMessage(messages["metricStack"].id, intl, stackItems);
            } else if (bucket.localIdentifier === BucketNames.STACK && intl) {
                warningMessage = getTranslation(messages["categoryStack"].id, intl);
            }

            if (warningMessage) {
                _set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
            }
        }
    });

    return updatedUiConfig;
}

export function setBaseChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = _cloneDeep(referencePoint);
    const buckets = referencePointConfigured?.buckets ?? [];
    const measuresCanAddItems = hasNoMeasures(buckets) || hasNoStacksWithDate(buckets);
    const stackCanAddItems = !hasMoreThanOneMasterMeasure(buckets, BucketNames.MEASURES);

    _set(referencePointConfigured, [UICONFIG], setBucketTitles(referencePoint, visualizationType, intl));
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        measuresCanAddItems,
    );
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], true);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "canAddItems"], stackCanAddItems);
    _set(
        referencePointConfigured,
        [UICONFIG, OPEN_AS_REPORT, SUPPORTED],
        !hasColorMapping(referencePointConfigured.properties),
    );

    const iconsMap: Record<string, { [key in BucketNameValues]?: string }> = {
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

    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"],
        iconsMap[visualizationType]?.[BucketNames.MEASURES],
    );
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"],
        iconsMap[visualizationType]?.[BucketNames.VIEW],
    );
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.STACK, "icon"],
        iconsMap[visualizationType]?.[BucketNames.STACK],
    );

    _set(
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
    if (visualizationType === VisualizationTypes.COLUMN) {
        const newReferencePoint = _cloneDeep(referencePoint);
        const buckets = newReferencePoint?.buckets;
        const filters = newReferencePoint?.filters;

        const percentEnabled = percentRecommendationEnabled(buckets, filters);
        const comparisonAndTrending = comparisonAndTrendingRecommendationEnabled(buckets);
        const overTimeComparison = overTimeComparisonRecommendationEnabled(newReferencePoint);
        const previousPeriod = previousPeriodRecommendationEnabled(buckets);

        _set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "percent"], percentEnabled);
        _set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "comparison"], comparisonAndTrending);
        _set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "trending"], comparisonAndTrending);
        _set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "overTimeComparison"], overTimeComparison);
        _set(newReferencePoint, [UICONFIG, RECOMMENDATIONS, "previousPeriod"], previousPeriod);

        return newReferencePoint;
    }
    return referencePoint;
}

function getBucketItemsIcons(bucket: IBucketItem[], intl: IntlShape): string {
    const attributeUsed = bucket.find((x) => !isDateBucketItem(x));
    const dateUsed = bucket.find((x) => isDateBucketItem(x));
    const orString = intl.formatMessage(messages["or"]);

    if (attributeUsed && dateUsed) {
        return `<span class="attr-field-icon" /> ${orString} <span class="date-field-icon" />`;
    } else if (attributeUsed) {
        return '<span class="attr-field-icon" />';
    } else {
        return '<span class="date-field-icon" />';
    }
}

export function getBucketItemsWarningMessage(
    messageId: string | undefined,
    intl: IntlShape,
    bucketItems: IBucketItem[],
): string {
    const icons = getBucketItemsIcons(bucketItems, intl);

    return getTranslation(messageId, intl, {
        icons,
    });
}
