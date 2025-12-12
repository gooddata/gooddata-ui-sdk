// (C) 2019-2025 GoodData Corporation
import { cloneDeep, set } from "lodash-es";

import { BucketNames } from "@gooddata/sdk-ui";

import { BUCKETS } from "../../constants/bucket.js";
import { UICONFIG } from "../../constants/uiConfig.js";
import { type IExtendedReferencePoint } from "../../interfaces/Visualization.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const measureIcon = "local:dependencyWheel/bucket-title-measures.svg";
const fromIcon = "local:dependencyWheel/bucket-title-from.svg";
const toIcon = "local:dependencyWheel/bucket-title-to.svg";

export const configDependencyWheelUiConfig = (
    extendedReferencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint => {
    const referencePointConfigured = cloneDeep(extendedReferencePoint);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], measureIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE_FROM, "icon"], fromIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE_TO, "icon"], toIcon);

    return referencePointConfigured;
};
