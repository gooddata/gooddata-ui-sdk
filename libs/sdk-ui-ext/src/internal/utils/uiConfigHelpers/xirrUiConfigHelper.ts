// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import set from "lodash/set";
import { IntlShape } from "react-intl";

import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { IReferencePoint, IUiConfig, ICustomError, IBucketOfFun } from "../../interfaces/Visualization";
import { DEFAULT_XIRR_UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";
import { hasNoMeasures, hasNoAttribute } from "../bucketRules";
import { setBucketTitles, getItemsCount } from "../bucketHelper";

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

    const buckets: IBucketOfFun[] = get(referencePoint, BUCKETS, []);

    const canAddMeasures = hasNoMeasures(buckets);
    const canAddAttribute = hasNoAttribute(buckets);

    set(uiConfig, [BUCKETS, BucketNames.MEASURES, "canAddItems"], canAddMeasures);
    set(uiConfig, [BUCKETS, BucketNames.ATTRIBUTE, "canAddItems"], canAddAttribute);

    uiConfig.customError = getCustomError(referencePoint, intl.formatMessage);

    return uiConfig;
};
