// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { setBucketTitles } from "../bucketHelper";

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
    const referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, [UICONFIG], setBucketTitles(referencePoint, visualizationType, intl));

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], heatmapMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], heatmapViewIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "icon"], heatmapStackIcon);

    return referencePointConfigured;
}
