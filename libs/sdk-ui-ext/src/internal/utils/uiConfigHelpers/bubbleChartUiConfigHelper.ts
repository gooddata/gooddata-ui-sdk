// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { IntlShape } from "react-intl";
import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";
import { setBucketTitles } from "./../bucketHelper";

import bubbleMeasuresXIcon from "../../assets/bubble/bucket-title-measures-x.svg";
import bubbleMeasuresYIcon from "../../assets/bubble/bucket-title-measures-y.svg";
import bubbleSizeIcon from "../../assets/bubble/bucket-title-size.svg";
import bubbleViewByIcon from "../../assets/bubble/bucket-title-view-by.svg";

export function setBubbleChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], bubbleMeasuresXIcon);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        bubbleMeasuresYIcon,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.TERTIARY_MEASURES, "icon"], bubbleSizeIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], bubbleViewByIcon);

    return referencePointConfigured;
}
