// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { IntlShape } from "react-intl";

import { BucketNames } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { setBucketTitles } from "./../bucketHelper";

import tableMeasuresIcon from "../../assets/table/bucket-title-measures.svg";
import tableAttributeIcon from "../../assets/table/bucket-title-attributes.svg";

export function setTableUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"], true);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "canAddItems"], true);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], tableMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "icon"], tableAttributeIcon);

    return referencePointConfigured;
}
