// (C) 2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import forEach from "lodash/forEach.js";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization.js";

import { UICONFIG, SUPPORTED, OPEN_AS_REPORT } from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";

import { hasMoreThanOneCategory, hasMoreThanOneMasterMeasure } from "../bucketRules.js";

import { setBucketTitles } from "../bucketHelper.js";
import { getTranslation } from "../translations.js";
import { hasColorMapping } from "../propertiesHelper.js";
import { messages } from "../../../locales.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const waterfallMeasuresIcon = "local:waterfall/bucket-title-measures.svg";
const waterfallViewIcon = "local:waterfall/bucket-title-view.svg";

function setWaterfallChartBucketWarningMessages(referencePoint: IExtendedReferencePoint, intl?: IntlShape) {
    const buckets = referencePoint?.buckets;
    const updatedUiConfig = cloneDeep(referencePoint?.uiConfig);

    forEach(buckets, (bucket) => {
        const localIdentifier = bucket?.localIdentifier ?? "";
        const bucketUiConfig = updatedUiConfig?.buckets?.[localIdentifier];

        // skip disabled buckets
        if (!bucketUiConfig?.enabled) {
            return;
        }

        if (!bucketUiConfig?.canAddItems && bucket.localIdentifier === BucketNames.VIEW) {
            const warningMessage = getTranslation(messages.category.id, intl);
            set(updatedUiConfig, [BUCKETS, localIdentifier, "warningMessage"], warningMessage);
        }
    });

    return updatedUiConfig;
}

export function setWaterfallChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const buckets = referencePointConfigured?.buckets ?? [];

    const measuresCanAddItems = !hasMoreThanOneCategory(buckets);
    const viewCanAddItems = !hasMoreThanOneMasterMeasure(buckets, BucketNames.MEASURES);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"],
        measuresCanAddItems,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], viewCanAddItems);
    set(
        referencePointConfigured,
        UICONFIG,
        setWaterfallChartBucketWarningMessages(referencePointConfigured, intl),
    );
    set(
        referencePointConfigured,
        [UICONFIG, OPEN_AS_REPORT, SUPPORTED],
        !hasColorMapping(referencePoint.properties),
    );

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], waterfallMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], waterfallViewIcon);

    return referencePointConfigured;
}

export function isWaterfallColorHeaderItemKey(headerName: string) {
    return [
        messages.colorTotalLabel.id,
        messages.colorPositiveLabel.id,
        messages.colorNegativeLabel.id,
    ].includes(headerName);
}

export function getWaterfallTotalColumnName(totalName: string, intl: IntlShape) {
    return totalName ?? getTranslation(messages.colorTotalLabel.id, intl);
}
