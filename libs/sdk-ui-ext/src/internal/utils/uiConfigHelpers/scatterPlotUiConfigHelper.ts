// (C) 2019-2025 GoodData Corporation
import { cloneDeep, set } from "lodash-es";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";

import { BUCKETS } from "../../constants/bucket.js";
import { UICONFIG } from "../../constants/uiConfig.js";
import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { getBucketItems, setBucketTitles } from "../bucketHelper.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const scatterMeasuresXIcon = "local:scatter/bucket-title-measures-x.svg";
const scatterMeasuresYIcon = "local:scatter/bucket-title-measures-y.svg";
const scatterViewIcon = "local:scatter/bucket-title-view.svg";
const scatterSegmentIcon = "local:scatter/bucket-title-segment.svg";

export function setScatterPlotUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    let referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], scatterMeasuresXIcon);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        scatterMeasuresYIcon,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "icon"], scatterViewIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"], scatterSegmentIcon);

    referencePointConfigured = disableClusteringIfSegmentationIsActive(referencePointConfigured);

    return referencePointConfigured;
}

/**
 * Clustering cannot be combined with segmentation,
 * so disable clustering if segmentation is active.
 *
 * @param referencePoint - reference point
 * @returns reference point with clustering disabled if segmentation is active, otherwise original reference point
 */
function disableClusteringIfSegmentationIsActive(
    referencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    const segmentByAttributes = getBucketItems(referencePoint.buckets, BucketNames.SEGMENT);

    if (referencePoint.properties?.controls?.["clustering"]?.enabled && segmentByAttributes.length > 0) {
        return {
            ...referencePoint,
            properties: {
                ...referencePoint.properties,
                controls: {
                    ...referencePoint.properties.controls,
                    clustering: {
                        ...referencePoint.properties.controls["clustering"],
                        enabled: false,
                    },
                },
            },
        };
    }

    return referencePoint;
}
