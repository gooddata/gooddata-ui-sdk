// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import forEach from "lodash/forEach.js";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";

import { UICONFIG, OPEN_AS_REPORT, SUPPORTED } from "../../constants/uiConfig.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket.js";

import { hasNoMeasures, hasOneMeasure, hasSomeSegmentByItems, hasNoStacksWithDate } from "../bucketRules.js";

import { getStackItems, setBucketTitles } from "../bucketHelper.js";
import { getTranslation } from "../translations.js";
import { hasColorMapping } from "../propertiesHelper.js";
import { getBucketItemsWarningMessage } from "./baseChartUiConfigHelper.js";
import { messages } from "../../../locales.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const lineMeasuresIcon = "local:line/bucket-title-measures.svg";
const lineTrendIcon = "local:line/bucket-title-trend.svg";
const lineSegmentIcon = "local:line/bucket-title-segment.svg";

function setLineChartBucketWarningMessages(referencePoint: IExtendedReferencePoint, intl?: IntlShape) {
    const buckets = referencePoint?.buckets || [];
    const updatedUiConfig = cloneDeep(referencePoint?.uiConfig);
    const stackItems = getStackItems(buckets, [ATTRIBUTE, DATE]);

    forEach(buckets, (bucket) => {
        const localIdentifier = bucket?.localIdentifier ?? "";
        const bucketUiConfig = updatedUiConfig?.buckets?.[localIdentifier];

        // skip disabled buckets
        if (!bucketUiConfig?.enabled) {
            return;
        }

        if (!bucketUiConfig?.canAddItems) {
            let warningMessage;
            if (bucket.localIdentifier === BucketNames.MEASURES) {
                warningMessage = getBucketItemsWarningMessage(messages.metricSegment.id, intl, stackItems);
            } else if (bucket.localIdentifier === BucketNames.SEGMENT) {
                warningMessage = getTranslation(messages.categorySegment.id, intl);
            }

            if (warningMessage) {
                set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
            }
        }
    });

    return updatedUiConfig;
}

export function setLineChartUiConfig(
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
        setLineChartBucketWarningMessages(referencePointConfigured, intl),
    );
    set(
        referencePointConfigured,
        [UICONFIG, OPEN_AS_REPORT, SUPPORTED],
        !hasColorMapping(referencePoint.properties),
    );

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], lineMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.TREND, "icon"], lineTrendIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"], lineSegmentIcon);

    return referencePointConfigured;
}
