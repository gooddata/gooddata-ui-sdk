// (C) 2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { _cloneDeep, _set } from "@gooddata/util";

import { BUCKETS } from "../../constants/bucket.js";
import { UICONFIG } from "../../constants/uiConfig.js";
import { type IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { setBucketTitles } from "../bucketHelper.js";

// If you need to edit these icons reflect changes also in gdc-analytical-designer BucketIcon.tsx
const mekkoWidthIcon = "local:mekko/bucket-title-width.svg";
const mekkoHeightIcon = "local:mekko/bucket-title-height.svg";
const mekkoViewIcon = "local:mekko/bucket-title-view.svg";
const mekkoStackIcon = "local:mekko/bucket-title-stack.svg";

export function setMekkoUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = _cloneDeep(referencePoint);

    _set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));

    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], mekkoWidthIcon);
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        mekkoHeightIcon,
    );
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], mekkoViewIcon);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "icon"], mekkoStackIcon);

    return referencePointConfigured;
}
