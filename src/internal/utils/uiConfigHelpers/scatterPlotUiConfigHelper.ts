// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import { InjectedIntl } from "react-intl";

import * as BucketNames from "../../../constants/bucketNames";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";
import { setBucketTitles } from "./../bucketHelper";

import * as scatterMeasuresXIcon from "../../assets/scatter/bucket-title-measures-x.svg";
import * as scatterMeasuresYIcon from "../../assets/scatter/bucket-title-measures-y.svg";
import * as scatterAttributeIcon from "../../assets/scatter/bucket-title-attribute.svg";

export function setScatterPlotUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: InjectedIntl,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], scatterMeasuresXIcon);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        scatterMeasuresYIcon,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "icon"], scatterAttributeIcon);

    return referencePointConfigured;
}
