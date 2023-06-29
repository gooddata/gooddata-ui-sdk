// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IntlShape } from "react-intl";

import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { IReferencePoint, IUiConfig, ICustomError } from "../../interfaces/Visualization.js";
import { DEFAULT_XIRR_UICONFIG } from "../../constants/uiConfig.js";
import { BUCKETS } from "../../constants/bucket.js";
import { hasNoMeasures, hasNoAttribute } from "../bucketRules.js";
import { setBucketTitles, getItemsCount } from "../bucketHelper.js";

export const getDefaultXirrUiConfig = (): IUiConfig => cloneDeep(DEFAULT_XIRR_UICONFIG);

function getCustomError(
    { buckets }: Readonly<IReferencePoint>,
    formatMessage: IntlShape["formatMessage"],
): ICustomError | undefined {
    const measuresCount = getItemsCount(buckets, BucketNames.MEASURES);
    const attributeCount = getItemsCount(buckets, BucketNames.ATTRIBUTE);

    if (measuresCount === 0 || attributeCount === 0) {
        return {
            heading: formatMessage({ id: "dashboard.xirr.error.invalid_buckets.heading" }),
            text: formatMessage({ id: "dashboard.xirr.error.invalid_buckets.text" }),
        };
    }

    return undefined;
}

export const getXirrUiConfig = (referencePoint: IReferencePoint, intl: IntlShape): IUiConfig => {
    const uiConfig = setBucketTitles(
        {
            ...referencePoint,
            uiConfig: getDefaultXirrUiConfig(),
        },
        VisualizationTypes.XIRR,
        intl,
    );

    const buckets = referencePoint?.buckets ?? [];

    const canAddMeasures = hasNoMeasures(buckets);
    const canAddAttribute = hasNoAttribute(buckets);

    set(uiConfig, [BUCKETS, BucketNames.MEASURES, "canAddItems"], canAddMeasures);
    set(uiConfig, [BUCKETS, BucketNames.ATTRIBUTE, "canAddItems"], canAddAttribute);

    uiConfig.customError = getCustomError(referencePoint, intl.formatMessage);

    return uiConfig;
};
