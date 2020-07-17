// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import set from "lodash/set";
import forEach from "lodash/forEach";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import {
    IExtendedReferencePoint,
    IBucketOfFun,
    IUiConfig,
    IBucketUiConfig,
} from "../../interfaces/Visualization";

import { UICONFIG, SUPPORTED, OPEN_AS_REPORT } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { hasMoreThanOneCategory, hasMoreThanOneMasterMeasure } from "./../bucketRules";

import { setBucketTitles } from "./../bucketHelper";
import { getTranslation } from "./../translations";

import pieMeasuresIcon from "../../assets/pie/bucket-title-measures.svg";
import pieViewIcon from "../../assets/pie/bucket-title-view.svg";
import { hasColorMapping } from "../propertiesHelper";

function setPieChartBucketWarningMessages(referencePoint: IExtendedReferencePoint, intl?: IntlShape) {
    const buckets: IBucketOfFun[] = get(referencePoint, BUCKETS);
    const updatedUiConfig: IUiConfig = cloneDeep(get(referencePoint, UICONFIG));

    forEach(buckets, (bucket: IBucketOfFun) => {
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
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets: IBucketOfFun[] = get(referencePointConfigured, BUCKETS, []);

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
