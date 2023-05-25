// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IntlShape } from "react-intl";

import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { IUiConfig, IReferencePoint } from "../../interfaces/Visualization.js";
import { DEFAULT_HEADLINE_UICONFIG } from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";

import { hasNoMeasures, hasNoSecondaryMeasures } from "../bucketRules.js";

import { setBucketTitles, getItemsCount } from "../bucketHelper.js";
import { getTranslation } from "../translations.js";
import { messages } from "../../../locales.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const headlineMeasuresIcon = "local:headline/bucket-title-measures.svg";
const headlineSecondaryMeasuresIcon = "local:headline/bucket-title-secondary-measures.svg";

export function getDefaultHeadlineUiConfig(): IUiConfig {
    return cloneDeep(DEFAULT_HEADLINE_UICONFIG);
}

export function getHeadlineUiConfig(referencePoint: IReferencePoint, intl: IntlShape): IUiConfig {
    let uiConfig = getDefaultHeadlineUiConfig();

    const buckets = referencePoint?.buckets ?? [];
    const viewCanAddPrimaryItems = hasNoMeasures(buckets);
    const viewCanAddSecondaryItems = hasNoSecondaryMeasures(buckets);

    uiConfig = setBucketTitles(
        {
            ...referencePoint,
            uiConfig,
        },
        VisualizationTypes.HEADLINE,
        intl,
    );

    set(uiConfig, [BUCKETS, BucketNames.MEASURES, "canAddItems"], viewCanAddPrimaryItems);
    set(uiConfig, [BUCKETS, BucketNames.SECONDARY_MEASURES, "canAddItems"], viewCanAddSecondaryItems);

    set(uiConfig, [BUCKETS, BucketNames.MEASURES, "icon"], headlineMeasuresIcon);
    set(uiConfig, [BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"], headlineSecondaryMeasuresIcon);

    const primaryMeasuresCount = getItemsCount(buckets, BucketNames.MEASURES);
    const secondaryMeasuresCount = getItemsCount(buckets, BucketNames.SECONDARY_MEASURES);

    if (primaryMeasuresCount === 0 && secondaryMeasuresCount !== 0) {
        uiConfig.customError = {
            heading: getTranslation(messages.heading.id, intl),
            text: getTranslation(messages.text.id, intl),
        };
    }

    return uiConfig;
}
