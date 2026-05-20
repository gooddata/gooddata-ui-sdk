// (C) 2026 GoodData Corporation

import { cloneDeep, set } from "lodash-es";
import { type IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";

import { messages } from "../../../locales.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket.js";
import { OPEN_AS_REPORT, SUPPORTED, UICONFIG } from "../../constants/uiConfig.js";
import { type IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { getStackItems, setBucketTitles } from "../bucketHelper.js";
import { hasNoMeasures, hasNoStacksWithDate, hasOneMeasure, hasSomeSegmentByItems } from "../bucketRules.js";
import { getTranslation } from "../translations.js";

import { getBucketItemsWarningMessage } from "./baseChartUiConfigHelper.js";

const radarMeasuresIcon = "local:radar/bucket-title-measures.svg";
const radarTrendIcon = "local:radar/bucket-title-trend.svg";
const radarSegmentIcon = "local:radar/bucket-title-segment.svg";

function setRadarChartBucketWarningMessages(referencePoint: IExtendedReferencePoint, intl?: IntlShape) {
    const buckets = referencePoint?.buckets || [];
    const updatedUiConfig = cloneDeep(referencePoint?.uiConfig);
    const stackItems = getStackItems(buckets, [ATTRIBUTE, DATE]);

    if (!updatedUiConfig) {
        return updatedUiConfig;
    }

    buckets.forEach((bucket) => {
        const localIdentifier = bucket?.localIdentifier ?? "";
        const bucketUiConfig = updatedUiConfig?.buckets?.[localIdentifier];

        // skip disabled buckets
        if (!bucketUiConfig?.enabled) {
            return;
        }

        if (!bucketUiConfig?.canAddItems) {
            let warningMessage;
            if (bucket.localIdentifier === BucketNames.MEASURES && intl) {
                warningMessage = getBucketItemsWarningMessage(messages["metricSegment"].id, intl, stackItems);
            } else if (bucket.localIdentifier === BucketNames.SEGMENT && intl) {
                warningMessage = getTranslation(messages["categorySegment"].id, intl);
            }

            if (warningMessage) {
                set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
            }
        }
    });

    return updatedUiConfig;
}

export function setRadarChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets = referencePointConfigured?.buckets ?? [];

    const measuresCanAddItems = hasNoMeasures(buckets) || hasNoStacksWithDate(buckets);
    const segmentCanAddItems =
        hasSomeSegmentByItems(buckets) || hasNoMeasures(buckets) || hasOneMeasure(buckets);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        measuresCanAddItems,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.TREND, "canAddItems"], true);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SEGMENT, "canAddItems"],
        segmentCanAddItems,
    );
    set(
        referencePointConfigured,
        UICONFIG,
        setRadarChartBucketWarningMessages(referencePointConfigured, intl),
    );
    set(referencePointConfigured, [UICONFIG, OPEN_AS_REPORT, SUPPORTED], false);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], radarMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.TREND, "icon"], radarTrendIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"], radarSegmentIcon);

    return referencePointConfigured;
}
