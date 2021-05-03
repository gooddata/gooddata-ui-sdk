// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import forEach from "lodash/forEach";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { hasMoreThanOneMasterMeasure, hasNoMeasures, hasOneCategory } from "../bucketRules";

import { setBucketTitles } from "../bucketHelper";
import { getTranslation } from "../translations";

import treemapMeasuresIcon from "../../assets/treemap/bucket-title-measures.svg";
import treemapViewIcon from "../../assets/treemap/bucket-title-view.svg";
import treemapSegmentIcon from "../../assets/treemap/bucket-title-segment.svg";

function setTreemapBucketWarningMessages(referencePoint: IExtendedReferencePoint, intl?: IntlShape) {
    const buckets = referencePoint?.buckets;
    const updatedUiConfig = cloneDeep(referencePoint?.uiConfig);

    forEach(buckets, (bucket) => {
        const localIdentifier = bucket?.localIdentifier ?? "";
        const bucketUiConfig = updatedUiConfig?.buckets?.[localIdentifier];

        // skip disabled buckets
        if (!bucketUiConfig?.enabled) {
            return;
        }

        if (!bucketUiConfig?.canAddItems) {
            let warningMessageId;
            if (bucket.localIdentifier === BucketNames.MEASURES) {
                warningMessageId = "dashboard.bucket.metric_view_by_warning";
            }

            if (bucket.localIdentifier === BucketNames.VIEW) {
                warningMessageId = "dashboard.bucket.category_category_by_warning";
            }

            if (bucket.localIdentifier === BucketNames.SEGMENT) {
                warningMessageId = "dashboard.bucket.category_segment_by_warning";
            }

            if (warningMessageId) {
                const warningMessage = getTranslation(warningMessageId, intl);
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
