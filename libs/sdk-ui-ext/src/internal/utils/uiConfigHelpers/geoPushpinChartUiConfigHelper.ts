// (C) 2019-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";

import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { UICONFIG, OPEN_AS_REPORT, SUPPORTED } from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";
import { setBucketTitles } from "../bucketHelper.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const geoPushPinBucketLocationIcon = "local:geoPushpin/bucket-title-location-icon.svg";
const geoPushPinBucketSizeIcon = "local:geoPushpin/bucket-title-size-icon.svg";
const geoPushPinBucketColorIcon = "local:geoPushpin/bucket-title-color-icon.svg";
const geoPushPinBucketSegmentIcon = "local:geoPushpin/bucket-title-segment-icon.svg";

import { BucketNames } from "@gooddata/sdk-ui";

export function setGeoPushpinUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.LOCATION, "icon"],
        geoPushPinBucketLocationIcon,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SIZE, "icon"], geoPushPinBucketSizeIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.COLOR, "icon"], geoPushPinBucketColorIcon);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"],
        geoPushPinBucketSegmentIcon,
    );
    // overide base config
    set(referencePointConfigured, [UICONFIG, OPEN_AS_REPORT, SUPPORTED], false);

    // only apply related bucket uiConfig
    set(referencePointConfigured, [UICONFIG, BUCKETS], {
        [BucketNames.LOCATION]: referencePointConfigured?.uiConfig?.buckets?.[BucketNames.LOCATION],
        [BucketNames.SIZE]: referencePointConfigured?.uiConfig?.buckets?.[BucketNames.SIZE],
        [BucketNames.COLOR]: referencePointConfigured?.uiConfig?.buckets?.[BucketNames.COLOR],
        [BucketNames.SEGMENT]: referencePointConfigured?.uiConfig?.buckets?.[BucketNames.SEGMENT],
        filters: referencePointConfigured?.uiConfig?.buckets?.filters,
    });

    return referencePointConfigured;
}
