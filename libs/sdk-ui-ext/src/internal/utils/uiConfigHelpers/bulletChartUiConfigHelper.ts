// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import { IntlShape } from "react-intl";
import { IExtendedReferencePoint, IBucketOfFun } from "../../interfaces/Visualization";
import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";
import { setBucketTitles, getItemsCount } from "./../bucketHelper";
import { getTranslation } from "../translations";

import bulletPrimaryMeasureIcon from "../../assets/bullet/bucket-title-primary.svg";
import bulletTargetMeasureIcon from "../../assets/bullet/bucket-title-target.svg";
import bulletComparativeMeasureIcon from "../../assets/bullet/bucket-title-comparative.svg";
import bulletViewByIcon from "../../assets/bullet/bucket-title-view-by.svg";
import { BucketNames } from "@gooddata/sdk-ui";

export function getBulletChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    referencePointConfigured[UICONFIG] = setBucketTitles(referencePointConfigured, visualizationType, intl);

    const buckets: IBucketOfFun[] = get(referencePoint, BUCKETS, []);

    const primaryMeasuresCount = getItemsCount(buckets, BucketNames.MEASURES);
    const secondaryMeasuresCount = getItemsCount(buckets, BucketNames.SECONDARY_MEASURES);
    const tertiaryMeasuresCount = getItemsCount(buckets, BucketNames.TERTIARY_MEASURES);

    referencePointConfigured[UICONFIG].buckets[BucketNames.MEASURES] = {
        ...referencePointConfigured[UICONFIG].buckets[BucketNames.MEASURES],
        canAddItems: primaryMeasuresCount < 1,
        icon: bulletPrimaryMeasureIcon as any,
    };

    referencePointConfigured[UICONFIG].buckets[BucketNames.SECONDARY_MEASURES] = {
        ...referencePointConfigured[UICONFIG].buckets[BucketNames.SECONDARY_MEASURES],
        canAddItems: secondaryMeasuresCount < 1,
        icon: bulletTargetMeasureIcon as any,
    };

    referencePointConfigured[UICONFIG].buckets[BucketNames.TERTIARY_MEASURES] = {
        ...referencePointConfigured[UICONFIG].buckets[BucketNames.TERTIARY_MEASURES],
        canAddItems: tertiaryMeasuresCount < 1,
        icon: bulletComparativeMeasureIcon as any,
    };

    referencePointConfigured[UICONFIG].buckets[BucketNames.VIEW] = {
        ...referencePointConfigured[UICONFIG].buckets[BucketNames.VIEW],
        icon: bulletViewByIcon as any,
    };

    if (primaryMeasuresCount === 0 && (secondaryMeasuresCount !== 0 || tertiaryMeasuresCount !== 0)) {
        referencePointConfigured[UICONFIG].customError = {
            heading: getTranslation("dashboard.error.missing_primary_bucket_item.heading", intl),
            text: getTranslation("dashboard.error.missing_primary_bucket_item.text", intl),
        };
    }

    return referencePointConfigured;
}
