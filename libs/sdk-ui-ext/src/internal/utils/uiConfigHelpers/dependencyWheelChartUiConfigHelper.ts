// (C) 2019-2023 GoodData Corporation
import set from "lodash/set.js";
import cloneDeep from "lodash/cloneDeep.js";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";

import { UICONFIG } from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";

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
