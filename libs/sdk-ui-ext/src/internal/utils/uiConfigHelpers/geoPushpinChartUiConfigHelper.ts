// (C) 2019-2020 GoodData Corporation
import { IntlShape } from "react-intl";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import { UICONFIG, OPEN_AS_REPORT, SUPPORTED } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";
import { setBucketTitles } from "../bucketHelper";

import geoPushPinBucketLocationIcon from "../../assets/geoPushpin/bucket-title-location-icon.svg";
import geoPushPinBucketSizeIcon from "../../assets/geoPushpin/bucket-title-size-icon.svg";
import geoPushPinBucketColorIcon from "../../assets/geoPushpin/bucket-title-color-icon.svg";
import geoPushPinBucketSegmentIcon from "../../assets/geoPushpin/bucket-title-segment-icon.svg";
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
