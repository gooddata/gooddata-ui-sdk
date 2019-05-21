// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import forEach = require("lodash/forEach");
import { InjectedIntl } from "react-intl";

import * as BucketNames from "../../../constants/bucketNames";
import { IExtendedReferencePoint, IBucket, IUiConfig, IBucketUiConfig } from "../../interfaces/Visualization";

import { UICONFIG, SUPPORTED, OPEN_AS_REPORT } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { hasMoreThanOneCategory, hasMoreThanOneMasterMeasure } from "./../bucketRules";

import { setBucketTitles } from "./../bucketHelper";
import { getTranslation } from "./../translations";

import * as pieMeasuresIcon from "../../assets/pie/bucket-title-measures.svg";
import * as pieViewIcon from "../../assets/pie/bucket-title-view.svg";
import { hasColorMapping } from "../propertiesHelper";

function setPieChartBucketWarningMessages(referencePoint: IExtendedReferencePoint, intl?: InjectedIntl) {
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
            if (bucket.localIdentifier === BucketNames.VIEW) {
                warningMessageId = "dashboard.bucket.category_category_by_warning";
            }

            if (warningMessageId) {
                const warningMessage = getTranslation(warningMessageId, intl);
                set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
            }
        }
    });

    return updatedUiConfig;
}

export function setPieChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: InjectedIntl,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets: IBucket[] = get(referencePointConfigured, BUCKETS, []);

    const measuresCanAddItems = !hasMoreThanOneCategory(buckets);
    const viewCanAddItems = !hasMoreThanOneMasterMeasure(buckets, BucketNames.MEASURES);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        measuresCanAddItems,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], viewCanAddItems);
    set(referencePointConfigured, UICONFIG, setPieChartBucketWarningMessages(referencePointConfigured, intl));
    set(
        referencePointConfigured,
        [UICONFIG, OPEN_AS_REPORT, SUPPORTED],
        !hasColorMapping(referencePoint.properties),
    );

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], pieMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], pieViewIcon);

    return referencePointConfigured;
}
