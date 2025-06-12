// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import {
    IExtendedReferencePoint,
    IBucketOfFun,
    IUiConfig,
    IBucketItem,
} from "../../interfaces/Visualization.js";

import { UICONFIG } from "../../constants/uiConfig.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket.js";

import { getMasterMeasuresCount, hasNoStacksWithDate } from "../bucketRules.js";

import { getItemsCount, getStackItems, getViewItems, setBucketTitles } from "../bucketHelper.js";

import { getBucketItemsWarningMessage } from "./baseChartUiConfigHelper.js";
import { getTranslation } from "../translations.js";
import { messages } from "../../../locales.js";

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
        ? getBucketItemsWarningMessage(messages.metricView.id, intl, viewItems)
        : getBucketItemsWarningMessage(messages.metricStack.id, intl, stackItems);
}

function getWarningMessageForViewByBucket(intl: IntlShape, measuresCount: number, stackItems: IBucketItem[]) {
    return measuresCount > 1
        ? getTranslation(messages.categoryView.id, intl)
        : getBucketItemsWarningMessage(messages.viewStack.id, intl, stackItems);
}

function getWarningMessageForStackByBucket(intl: IntlShape, categoriesCount: number) {
    return categoriesCount > 1
        ? getTranslation(messages.stackView.id, intl)
        : getTranslation(messages.measureStack.id, intl);
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
