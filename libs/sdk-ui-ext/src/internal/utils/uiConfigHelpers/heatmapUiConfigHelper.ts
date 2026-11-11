// (C) 2019-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { _cloneDeep, _set } from "@gooddata/util";

import { BUCKETS } from "../../constants/bucket.js";
import { UICONFIG } from "../../constants/uiConfig.js";
import { type IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { setBucketTitles } from "../bucketHelper.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const heatmapMeasuresIcon = "local:heatmap/bucket-title-measures.svg";
const heatmapViewIcon = "local:heatmap/bucket-title-view.svg";
const heatmapStackIcon = "local:heatmap/bucket-title-stack.svg";

export function setHeatmapUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = _cloneDeep(referencePoint);

    _set(referencePointConfigured, [UICONFIG], setBucketTitles(referencePoint, visualizationType, intl));

    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], heatmapMeasuresIcon);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], heatmapViewIcon);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "icon"], heatmapStackIcon);

    return referencePointConfigured;
}
