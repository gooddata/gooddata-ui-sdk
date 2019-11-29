// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import { IntlShape } from "react-intl";

import * as BucketNames from "../../../base/constants/bucketNames";
import { IBucketOfFun, IUiConfig, IReferencePoint } from "../../interfaces/Visualization";
import { DEFAULT_HEADLINE_UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { hasNoMeasures, hasNoSecondaryMeasures } from "./../bucketRules";

import { setBucketTitles, getItemsCount } from "./../bucketHelper";
import { getTranslation } from "./../translations";

import * as headlineMeasuresIcon from "../../assets/headline/bucket-title-measures.svg";
import * as headlineSecondaryMeasuresIcon from "../../assets/headline/bucket-title-secondary-measures.svg";
import { VisualizationTypes } from "../../../base/constants/visualizationTypes";

export function getDefaultHeadlineUiConfig(): IUiConfig {
    return cloneDeep(DEFAULT_HEADLINE_UICONFIG);
}

export function getHeadlineUiConfig(referencePoint: IReferencePoint, intl: IntlShape): IUiConfig {
    let uiConfig = getDefaultHeadlineUiConfig();

    const buckets: IBucketOfFun[] = get(referencePoint, BUCKETS, []);
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
            heading: getTranslation("dashboard.headline.error.missing_bucket_item.heading", intl),
            text: getTranslation("dashboard.headline.error.missing_bucket_item.text", intl),
        };
    }

    return uiConfig;
}
