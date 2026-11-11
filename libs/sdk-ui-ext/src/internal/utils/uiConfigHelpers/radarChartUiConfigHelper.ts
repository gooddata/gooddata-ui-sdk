// (C) 2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { _cloneDeep, _set } from "@gooddata/util";

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
    const updatedUiConfig = _cloneDeep(referencePoint?.uiConfig);
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
                _set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
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
    const referencePointConfigured = _cloneDeep(referencePoint);
    const buckets = referencePointConfigured?.buckets ?? [];

    const measuresCanAddItems = hasNoMeasures(buckets) || hasNoStacksWithDate(buckets);
    const segmentCanAddItems =
        hasSomeSegmentByItems(buckets) || hasNoMeasures(buckets) || hasOneMeasure(buckets);

    _set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        measuresCanAddItems,
    );
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.TREND, "canAddItems"], true);
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SEGMENT, "canAddItems"],
        segmentCanAddItems,
    );
    _set(
        referencePointConfigured,
        UICONFIG,
        setRadarChartBucketWarningMessages(referencePointConfigured, intl),
    );
    _set(referencePointConfigured, [UICONFIG, OPEN_AS_REPORT, SUPPORTED], false);

    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], radarMeasuresIcon);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.TREND, "icon"], radarTrendIcon);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"], radarSegmentIcon);

    return referencePointConfigured;
}
