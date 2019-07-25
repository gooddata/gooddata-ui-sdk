// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import forEach = require("lodash/forEach");
import { InjectedIntl } from "react-intl";

import * as BucketNames from "../../../constants/bucketNames";
import { IExtendedReferencePoint, IBucket, IUiConfig, IBucketUiConfig } from "../../interfaces/Visualization";

import { UICONFIG, OPEN_AS_REPORT, SUPPORTED } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { hasNoStacks, hasNoMeasures, hasOneMeasure, hasSomeSegmentByItems } from "./../bucketRules";

import { setBucketTitles } from "./../bucketHelper";
import { getTranslation } from "./../translations";

import * as lineMeasuresIcon from "../../assets/line/bucket-title-measures.svg";
import * as lineTrendIcon from "../../assets/line/bucket-title-trend.svg";
import * as lineSegmentIcon from "../../assets/line/bucket-title-segment.svg";
import { hasColorMapping } from "../propertiesHelper";

function setLineChartBucketWarningMessages(referencePoint: IExtendedReferencePoint, intl?: InjectedIntl) {
    const buckets: IBucket[] = get(referencePoint, BUCKETS);
    const updatedUiConfig: IUiConfig = cloneDeep(get(referencePoint, UICONFIG));

    forEach(buckets, (bucket: IBucket) => {
        const localIdentifier: string = get(bucket, "localIdentifier", "");
        const bucketUiConfig: IBucketUiConfig = get(updatedUiConfig, [BUCKETS, localIdentifier]);

        // skip disabled buckets
        if (!get(bucketUiConfig, "enabled", false)) {
            return;
        }

        if (!get(bucketUiConfig, "canAddItems")) {
            let warningMessageId;
            if (bucket.localIdentifier === BucketNames.MEASURES) {
                warningMessageId = "dashboard.bucket.metric_segment_by_warning";
            } else if (bucket.localIdentifier === BucketNames.SEGMENT) {
                warningMessageId = "dashboard.bucket.category_segment_by_warning";
            }

            if (warningMessageId) {
                const warningMessage = getTranslation(warningMessageId, intl);
                set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
            }
        }
    });

    return updatedUiConfig;
}

export function setLineChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: InjectedIntl,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets: IBucket[] = get(referencePointConfigured, BUCKETS, []);

    const measuresCanAddItems = hasNoMeasures(buckets) || hasNoStacks(buckets);
    const segmentCanAddItems =
        hasSomeSegmentByItems(buckets) || hasNoMeasures(buckets) || hasOneMeasure(buckets);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        measuresCanAddItems,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.TREND, "canAddItems"], true);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SEGMENT, "canAddItems"],
        segmentCanAddItems,
    );
    set(
        referencePointConfigured,
        UICONFIG,
        setLineChartBucketWarningMessages(referencePointConfigured, intl),
    );
    set(
        referencePointConfigured,
        [UICONFIG, OPEN_AS_REPORT, SUPPORTED],
        !hasColorMapping(referencePoint.properties),
    );

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], lineMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.TREND, "icon"], lineTrendIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"], lineSegmentIcon);

    return referencePointConfigured;
}
