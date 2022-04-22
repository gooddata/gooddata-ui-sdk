// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import {
    IExtendedReferencePoint,
    IBucketOfFun,
    IUiConfig,
    IBucketItem,
} from "../../interfaces/Visualization";

import { UICONFIG } from "../../constants/uiConfig";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket";

import { getMasterMeasuresCount, hasNoStacksWithDate } from "../bucketRules";

import { getItemsCount, getStackItems, getViewItems, setBucketTitles } from "../bucketHelper";

import { getBucketItemsWarningMessage } from "./baseChartUiConfigHelper";
import { getTranslation } from "../translations";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const areaMeasuresIcon = "local:area/bucket-title-measures.svg";
const areaViewIcon = "local:area/bucket-title-view.svg";
const areaStackIcon = "local:area/bucket-title-stack.svg";

function getWarningMessageForMeasuresBucket(
    intl: IntlShape,
    categoriesCount: number,
    stackItems: IBucketItem[],
    viewItems: IBucketItem[],
) {
    return categoriesCount > 1
        ? getBucketItemsWarningMessage("dashboard.bucket.metric_view_by_warning", intl, viewItems)
        : getBucketItemsWarningMessage("dashboard.bucket.metric_stack_by_warning", intl, stackItems);
}

function getWarningMessageForViewByBucket(intl: IntlShape, measuresCount: number, stackItems: IBucketItem[]) {
    return measuresCount > 1
        ? getTranslation("dashboard.bucket.category_view_by_warning", intl)
        : getBucketItemsWarningMessage("dashboard.bucket.view_stack_by_warning", intl, stackItems);
}

function getWarningMessageForStackByBucket(intl: IntlShape, categoriesCount: number) {
    return categoriesCount > 1
        ? getTranslation("dashboard.bucket.stack_view_by_warning", intl)
        : getTranslation("dashboard.bucket.measure_stack_by_warning", intl);
}

function setAreaChartBucketWarningMessages(
    referencePoint: IExtendedReferencePoint,
    messageConfig: { [bucketName: string]: string },
): IUiConfig {
    const buckets = referencePoint?.buckets ?? [];
    const updatedUiConfig = referencePoint?.uiConfig;

    return buckets.reduce((uiConfig: IUiConfig, bucket: IBucketOfFun) => {
        const localIdentifier = bucket?.localIdentifier ?? "";
        const bucketUiConfig = uiConfig?.buckets?.[localIdentifier];
        const isEnabled = bucketUiConfig?.enabled ?? false;
        const canAddItem = bucketUiConfig?.canAddItems;

        // skip disabled buckets
        if (canAddItem || !isEnabled) {
            return uiConfig;
        }

        const warningMessage = messageConfig[localIdentifier];

        return set(uiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
    }, updatedUiConfig);
}

export function setAreaChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets = referencePointConfigured?.buckets ?? [];
    const categoriesCount = getItemsCount(buckets, BucketNames.VIEW);

    const stackItems = getStackItems(buckets, [ATTRIBUTE, DATE]);
    const viewItems = getViewItems(buckets, [ATTRIBUTE, DATE]);

    const measuresCount = getMasterMeasuresCount(buckets, BucketNames.MEASURES);
    const isStackEmpty = hasNoStacksWithDate(buckets);
    const canAddMeasuresItems = !measuresCount || (categoriesCount <= 1 && isStackEmpty);
    const canAddViewItems = !categoriesCount || (measuresCount <= 1 && isStackEmpty);
    const canAddStackItems = categoriesCount <= 1 && measuresCount <= 1;
    const messageConfig = {
        [BucketNames.MEASURES]: getWarningMessageForMeasuresBucket(
            intl,
            categoriesCount,
            stackItems,
            viewItems,
        ),
        [BucketNames.VIEW]: getWarningMessageForViewByBucket(intl, measuresCount, stackItems),
        [BucketNames.STACK]: getWarningMessageForStackByBucket(intl, categoriesCount),
    };

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        canAddMeasuresItems,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], canAddViewItems);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "canAddItems"], canAddStackItems);
    setAreaChartBucketWarningMessages(referencePointConfigured, messageConfig);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], areaMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], areaViewIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.STACK, "icon"], areaStackIcon);

    return referencePointConfigured;
}
