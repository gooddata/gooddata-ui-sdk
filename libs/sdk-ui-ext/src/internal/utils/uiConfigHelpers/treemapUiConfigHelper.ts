// (C) 2019-2025 GoodData Corporation
import { cloneDeep, set } from "lodash-es";
import { type IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";

import { getBucketItemsWarningMessage } from "./baseChartUiConfigHelper.js";
import { messages } from "../../../locales.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket.js";
import { UICONFIG } from "../../constants/uiConfig.js";
import { type IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { getViewItems, setBucketTitles } from "../bucketHelper.js";
import { hasMoreThanOneMasterMeasure, hasNoMeasures, hasOneCategory } from "../bucketRules.js";
import { getTranslation } from "../translations.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const treemapMeasuresIcon = "local:treemap/bucket-title-measures.svg";
const treemapViewIcon = "local:treemap/bucket-title-view.svg";
const treemapSegmentIcon = "local:treemap/bucket-title-segment.svg";

function setTreemapBucketWarningMessages(referencePoint: IExtendedReferencePoint, intl?: IntlShape) {
    const buckets = referencePoint?.buckets || [];
    const updatedUiConfig = cloneDeep(referencePoint?.uiConfig);
    const viewItems = getViewItems(buckets, [ATTRIBUTE, DATE]);

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

        if (!bucketUiConfig?.canAddItems && intl) {
            let warningMessage;
            if (bucket.localIdentifier === BucketNames.MEASURES) {
                warningMessage = getBucketItemsWarningMessage(messages["metricView"].id, intl, viewItems);
            }

            if (bucket.localIdentifier === BucketNames.VIEW) {
                warningMessage = getTranslation(messages["category"].id, intl);
            }

            if (bucket.localIdentifier === BucketNames.SEGMENT) {
                warningMessage = getTranslation(messages["categorySegment"].id, intl);
            }

            if (warningMessage) {
                set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
            }
        }
    });

    return updatedUiConfig;
}

export function setTreemapUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets = referencePointConfigured?.buckets ?? [];

    const measuresCanAddItems = !hasOneCategory(buckets) || hasNoMeasures(buckets);
    const viewCanAddItems = !hasMoreThanOneMasterMeasure(buckets, BucketNames.MEASURES);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        measuresCanAddItems,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], viewCanAddItems);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT, "canAddItems"], true);
    set(referencePointConfigured, UICONFIG, setTreemapBucketWarningMessages(referencePointConfigured, intl));

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], treemapMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], treemapViewIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"], treemapSegmentIcon);

    return referencePointConfigured;
}
