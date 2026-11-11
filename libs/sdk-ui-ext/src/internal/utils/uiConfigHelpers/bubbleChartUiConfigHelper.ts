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
const bubbleMeasuresXIcon = "local:bubble/bucket-title-measures-x.svg";
const bubbleMeasuresYIcon = "local:bubble/bucket-title-measures-y.svg";
const bubbleSizeIcon = "local:bubble/bucket-title-size.svg";
const bubbleViewByIcon = "local:bubble/bucket-title-view-by.svg";

export function setBubbleChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = _cloneDeep(referencePoint);

    _set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));

    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], bubbleMeasuresXIcon);
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        bubbleMeasuresYIcon,
    );
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.TERTIARY_MEASURES, "icon"],
        bubbleSizeIcon,
    );
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], bubbleViewByIcon);

    return referencePointConfigured;
}
