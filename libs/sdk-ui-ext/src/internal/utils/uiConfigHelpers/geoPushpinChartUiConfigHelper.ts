// (C) 2019-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type ISettings } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type IGeoConfig } from "@gooddata/sdk-ui-geo";
import { _cloneDeep, _set } from "@gooddata/util";

import { BUCKETS } from "../../constants/bucket.js";
import { isGeoPushpinIconEnabled } from "../../constants/featureFlags.js";
import { OPEN_AS_REPORT, SUPPORTED, UICONFIG } from "../../constants/uiConfig.js";
import { type IExtendedReferencePoint } from "../../interfaces/Visualization.js";
import { getItemsCount, setBucketTitles } from "../bucketHelper.js";
import { arePushpinSizeColorBucketsEditable } from "../geoPushpinCompatibility.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const geoPushPinBucketLocationIcon = "local:geoPushpin/bucket-title-location-icon.svg";
const geoPushPinBucketSizeIcon = "local:geoPushpin/bucket-title-size-icon.svg";
const geoPushPinBucketColorIcon = "local:geoPushpin/bucket-title-color-icon.svg";
const geoPushPinBucketSegmentIcon = "local:geoPushpin/bucket-title-segment-icon.svg";
const geoPushPinBucketMetricIcon = "local:geoPushpin/bucket-title-size-icon.svg";

function canAddItemsToBucket(referencePoint: IExtendedReferencePoint, bucketName: string): boolean {
    const itemsLimit = referencePoint.uiConfig?.buckets?.[bucketName]?.itemsLimit;

    if (itemsLimit === undefined) {
        return true;
    }

    return getItemsCount(referencePoint.buckets ?? [], bucketName) < itemsLimit;
}

export function setGeoPushpinUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
    featureFlags?: ISettings,
): IExtendedReferencePoint {
    const referencePointConfigured = _cloneDeep(referencePoint);
    _set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.LOCATION, "icon"],
        geoPushPinBucketLocationIcon,
    );
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SIZE, "icon"], geoPushPinBucketSizeIcon);
    _set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.COLOR, "icon"], geoPushPinBucketColorIcon);
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"],
        geoPushPinBucketSegmentIcon,
    );
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"],
        geoPushPinBucketMetricIcon,
    );
    // overide base config
    _set(referencePointConfigured, [UICONFIG, OPEN_AS_REPORT, SUPPORTED], false);

    const iconEnabled = isGeoPushpinIconEnabled(featureFlags);
    const shapeType = referencePointConfigured.properties?.controls?.["points"]?.shapeType ?? "circle";
    const sizeColorBucketsEditable = arePushpinSizeColorBucketsEditable(shapeType);

    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.LOCATION, "canAddItems"],
        canAddItemsToBucket(referencePointConfigured, BucketNames.LOCATION),
    );
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SIZE, "canAddItems"],
        canAddItemsToBucket(referencePointConfigured, BucketNames.SIZE) && sizeColorBucketsEditable,
    );
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.COLOR, "canAddItems"],
        canAddItemsToBucket(referencePointConfigured, BucketNames.COLOR) && sizeColorBucketsEditable,
    );
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SEGMENT, "canAddItems"],
        canAddItemsToBucket(referencePointConfigured, BucketNames.SEGMENT) && sizeColorBucketsEditable,
    );
    _set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        canAddItemsToBucket(referencePointConfigured, BucketNames.MEASURES),
    );

    // Build the filtered bucket set
    const filteredBuckets: Record<string, unknown> = {
        [BucketNames.LOCATION]: referencePointConfigured?.uiConfig?.buckets?.[BucketNames.LOCATION],
        [BucketNames.SIZE]: referencePointConfigured?.uiConfig?.buckets?.[BucketNames.SIZE],
        [BucketNames.COLOR]: referencePointConfigured?.uiConfig?.buckets?.[BucketNames.COLOR],
        [BucketNames.SEGMENT]: referencePointConfigured?.uiConfig?.buckets?.[BucketNames.SEGMENT],
        filters: referencePointConfigured?.uiConfig?.buckets?.["filters"],
    };

    // Only include metric bucket when feature flag is enabled
    if (iconEnabled) {
        filteredBuckets[BucketNames.MEASURES] =
            referencePointConfigured?.uiConfig?.buckets?.[BucketNames.MEASURES];
    }

    // only apply related bucket uiConfig
    _set(referencePointConfigured, [UICONFIG, BUCKETS], filteredBuckets);

    return referencePointConfigured;
}

export function updateConfigWithSettings(config: IGeoConfig, settings: ISettings): IGeoConfig {
    if (!settings) {
        return config;
    }

    return {
        ...config,
        respectLegendPosition: true,
    };
}
