// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import { InjectedIntl } from "react-intl";

import * as BucketNames from "../../../constants/bucketNames";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import { BUCKETS } from "../../constants/bucket";
import { setBucketTitles } from "../bucketHelper";

import * as comboSecondaryMeasuresIcon from "../../assets/combo/bucket-title-secondary-measures.svg";

import * as columnMeasureIcon from "../../assets/combo/bucket-title-measures-column.svg";

import * as columnLineIcon from "../../assets/combo/bucket-title-view-column-line.svg";

import { UICONFIG } from "../../constants/uiConfig";
import { ChartType } from "../../../constants/visualizationTypes";

export function setComboChartUiConfigDeprecated(
    referencePoint: IExtendedReferencePoint,
    intl: InjectedIntl,
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
