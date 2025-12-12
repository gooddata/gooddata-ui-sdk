// (C) 2019-2025 GoodData Corporation
import { cloneDeep, set } from "lodash-es";
import { type IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";

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
    const referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], bubbleMeasuresXIcon);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        bubbleMeasuresYIcon,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.TERTIARY_MEASURES, "icon"], bubbleSizeIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], bubbleViewByIcon);

    return referencePointConfigured;
}
