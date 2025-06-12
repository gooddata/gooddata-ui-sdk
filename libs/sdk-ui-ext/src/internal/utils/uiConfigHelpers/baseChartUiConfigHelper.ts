// (C) 2019-2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import forEach from "lodash/forEach.js";
import { IntlShape } from "react-intl";

import { BucketNameValues, BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    IExtendedReferencePoint,
    IBucketOfFun,
    IUiConfig,
    IBucketItem,
} from "../../interfaces/Visualization.js";

import { UICONFIG, RECOMMENDATIONS, OPEN_AS_REPORT, SUPPORTED } from "../../constants/uiConfig.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket.js";
import { messages } from "../../../locales.js";

import {
    comparisonAndTrendingRecommendationEnabled,
    overTimeComparisonRecommendationEnabled,
    hasNoMeasures,
    hasMoreThanOneMasterMeasure,
    percentRecommendationEnabled,
    previousPeriodRecommendationEnabled,
    hasNoStacksWithDate,
} from "../bucketRules.js";

import { getStackItems, isDateBucketItem, setBucketTitles } from "../bucketHelper.js";
import { getTranslation } from "../translations.js";
import { hasColorMapping } from "../propertiesHelper.js";

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
): IUiConfig {
    const buckets = referencePoint?.buckets ?? [];
    const updatedUiConfig = cloneDeep(referencePoint?.uiConfig);
    const stackItems = getStackItems(buckets, [ATTRIBUTE, DATE]);

    forEach(buckets, (bucket: IBucketOfFun) => {
        const localIdentifier = bucket?.localIdentifier ?? "";
        const bucketUiConfig = updatedUiConfig?.buckets?.[localIdentifier];

        // skip disabled buckets
        if (!bucketUiConfig?.enabled) {
            return;
        }

        if (!bucketUiConfig?.canAddItems) {
            let warningMessage;
            if (bucket.localIdentifier === BucketNames.MEASURES) {
                warningMessage = getBucketItemsWarningMessage(messages.metricStack.id, intl, stackItems);
            } else if (bucket.localIdentifier === BucketNames.STACK) {
                warningMessage = getTranslation(messages.categoryStack.id, intl);
            }

            if (warningMessage) {
                set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
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
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets = referencePointConfigured?.buckets ?? [];
    const measuresCanAddItems = hasNoMeasures(buckets) || hasNoStacksWithDate(buckets);
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

    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"],
        iconsMap[visualizationType]?.[BucketNames.MEASURES],
    );
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"],
        iconsMap[visualizationType]?.[BucketNames.VIEW],
    );
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.STACK, "icon"],
        iconsMap[visualizationType]?.[BucketNames.STACK],
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
    weekFiltersEnabled: boolean,
): IExtendedReferencePoint {
    if (visualizationType === VisualizationTypes.COLUMN) {
        const newReferencePoint = cloneDeep(referencePoint);
        const buckets = newReferencePoint?.buckets;
        const filters = newReferencePoint?.filters;

        const percentEnabled = percentRecommendationEnabled(buckets, filters);
        const comparisonAndTrending = comparisonAndTrendingRecommendationEnabled(buckets);
        const overTimeComparison = overTimeComparisonRecommendationEnabled(
            newReferencePoint,
            weekFiltersEnabled,
        );
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

function getBucketItemsIcons(bucket: IBucketItem[], intl: IntlShape): string {
    const attributeUsed = bucket.find((x) => !isDateBucketItem(x));
    const dateUsed = bucket.find((x) => isDateBucketItem(x));
    const orString = intl.formatMessage(messages.or);

    if (attributeUsed && dateUsed) {
        return `<span class="attr-field-icon" /> ${orString} <span class="date-field-icon" />`;
    } else if (attributeUsed) {
        return '<span class="attr-field-icon" />';
    } else {
        return '<span class="date-field-icon" />';
    }
}

export function getBucketItemsWarningMessage(
    messageId: string,
    intl: IntlShape,
    bucketItems: IBucketItem[],
): string {
    const icons = getBucketItemsIcons(bucketItems, intl);

    return getTranslation(messageId, intl, {
        icons,
    });
}
