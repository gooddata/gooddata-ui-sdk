// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { IntlShape } from "react-intl";

import { BucketNames, ChartType } from "@gooddata/sdk-ui";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import { BUCKETS } from "../../constants/bucket";
import { setBucketTitles } from "../bucketHelper";

import comboSecondaryMeasuresIcon from "../../assets/combo/bucket-title-secondary-measures.svg";

import columnMeasureIcon from "../../assets/combo/bucket-title-measures-column.svg";

import columnLineIcon from "../../assets/combo/bucket-title-view-column-line.svg";

import { UICONFIG } from "../../constants/uiConfig";

export function setComboChartUiConfigDeprecated(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: ChartType,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"], true);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "canAddItems"], true);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "canAddItems"], true);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], columnMeasureIcon);
    set(
        referencePointConfigured,
        [UICONFIG, BUCKETS, BucketNames.SECONDARY_MEASURES, "icon"],
        comboSecondaryMeasuresIcon,
    );
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], columnLineIcon);

    return referencePointConfigured;
}
