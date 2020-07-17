// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import set from "lodash/set";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import {
    IExtendedReferencePoint,
    IBucketOfFun,
    IUiConfig,
    IBucketUiConfig,
} from "../../interfaces/Visualization";

import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { hasNoStacks, getMasterMeasuresCount } from "../bucketRules";

import { getItemsCount, setBucketTitles } from "../bucketHelper";

import areaMeasuresIcon from "../../assets/area/bucket-title-measures.svg";
import areaViewIcon from "../../assets/area/bucket-title-view.svg";
import areaStackIcon from "../../assets/area/bucket-title-stack.svg";

function getWarningMessageIdForMeasuresBucket(categoriesCount: number) {
    return categoriesCount > 1
        ? "dashboard.bucket.metric_view_by_warning"
        : "dashboard.bucket.metric_stack_by_warning";
}

function getWarningMessageIdForViewByBucket(measuresCount: number) {
    return measuresCount > 1
        ? "dashboard.bucket.category_view_by_warning"
        : "dashboard.bucket.view_stack_by_warning";
}

function getWarningMessageIdForStackByBucket(categoriesCount: number) {
    return categoriesCount > 1
        ? "dashboard.bucket.stack_view_by_warning"
        : "dashboard.bucket.measure_stack_by_warning";
}

function setAreaChartBucketWarningMessages(
    referencePoint: IExtendedReferencePoint,
    messageConfig: { [bucketName: string]: string },
    intl?: IntlShape,
): IUiConfig {
    const buckets: IBucketOfFun[] = get(referencePoint, BUCKETS, []);
    const updatedUiConfig: IUiConfig = get(referencePoint, UICONFIG);

    return buckets.reduce((uiConfig: IUiConfig, bucket: IBucketOfFun) => {
        const localIdentifier: string = get(bucket, "localIdentifier", "");
        const bucketUiConfig: IBucketUiConfig = get(uiConfig, [BUCKETS, localIdentifier]);
        const isEnabled: boolean = get(bucketUiConfig, "enabled", false);
        const canAddItem: boolean = get(bucketUiConfig, "canAddItems");

        // skip disabled buckets
        if (canAddItem || !isEnabled) {
            return uiConfig;
        }

        const warningMessageId = messageConfig[localIdentifier];
        const warningMessage = intl ? intl.formatMessage({ id: warningMessageId }) : warningMessageId;

        return set(uiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
    }, updatedUiConfig);
}

export function setAreaChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets: IBucketOfFun[] = get(referencePointConfigured, BUCKETS, []);
    const categoriesCount = getItemsCount(buckets, BucketNames.VIEW);
    const measuresCount = getMasterMeasuresCount(buckets, BucketNames.MEASURES);
    const isStackEmpty = hasNoStacks(buckets);
    const canAddMeasuresItems = !measuresCount || (categoriesCount <= 1 && isStackEmpty);
    const canAddViewItems = !categoriesCount || (measuresCount <= 1 && isStackEmpty);
    const canAddStackItems = categoriesCount <= 1 && measuresCount <= 1;
    const messageConfig = {
        [BucketNames.MEASURES]: getWarningMessageIdForMeasuresBucket(categoriesCount),
        [BucketNames.VIEW]: getWarningMessageIdForViewByBucket(measuresCount),
        [BucketNames.STACK]: getWarningMessageIdForStackByBucket(categoriesCount),
    };

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        canAddMeasuresItems,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], canAddViewItems);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "canAddItems"], canAddStackItems);
    setAreaChartBucketWarningMessages(referencePointConfigured, messageConfig, intl);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], areaMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], areaViewIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "icon"], areaStackIcon);

    return referencePointConfigured;
}
