// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import { InjectedIntl } from "react-intl";
import * as BucketNames from "../../../constants/bucketNames";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";
import { setBucketTitles } from "./../bucketHelper";

import * as bubbleMeasuresXIcon from "../../assets/bubble/bucket-title-measures-x.svg";
import * as bubbleMeasuresYIcon from "../../assets/bubble/bucket-title-measures-y.svg";
import * as bubbleSizeIcon from "../../assets/bubble/bucket-title-size.svg";
import * as bubbleViewByIcon from "../../assets/bubble/bucket-title-view-by.svg";

export function setBubbleChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: InjectedIntl,
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
