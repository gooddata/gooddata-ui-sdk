// (C) 2019-2024 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { UICONFIG } from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";
import { setBucketTitles } from "../bucketHelper.js";

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
    const referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], scatterMeasuresXIcon);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        scatterMeasuresYIcon,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "icon"], scatterViewIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"], scatterSegmentIcon);

    return referencePointConfigured;
}
