// (C) 2025 GoodData Corporation

import { set } from "lodash-es";
import { type IntlShape } from "react-intl";

import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { BUCKETS } from "../../constants/bucket.js";
import { type IExtendedReferencePoint, type IUiConfig } from "../../interfaces/Visualization.js";
import { setBucketTitles } from "../bucketHelper.js";

const geoAreaBucketAreaIcon = "local:geoPushpin/bucket-title-location-icon.svg";
const geoAreaBucketColorIcon = "local:geoPushpin/bucket-title-color-icon.svg";
const geoAreaBucketSegmentIcon = "local:geoPushpin/bucket-title-segment-icon.svg";

function setBucketIcon(uiConfig: IUiConfig, bucketName: string, icon: string) {
    if (!uiConfig) {
        return;
    }

    set(uiConfig, [BUCKETS, bucketName, "icon"], icon);
}

/**
 * Sets the UI config for geo area chart reference point.
 * Configures bucket titles and other UI elements specific to area visualization.
 *
 * @param referencePoint - Reference point to configure
 * @param intl - Internationalization object for translations
 * @returns Extended reference point with geo area UI config
 * @internal
 */
export function setGeoAreaUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
): IExtendedReferencePoint {
    const newUiConfig = setBucketTitles(referencePoint, VisualizationTypes.CHOROPLETH, intl);

    setBucketIcon(newUiConfig, BucketNames.AREA, geoAreaBucketAreaIcon);
    setBucketIcon(newUiConfig, BucketNames.COLOR, geoAreaBucketColorIcon);
    setBucketIcon(newUiConfig, BucketNames.SEGMENT, geoAreaBucketSegmentIcon);

    return {
        ...referencePoint,
        uiConfig: newUiConfig,
    };
}
