// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import assign = require("lodash/assign");

import * as BucketNames from "../../../constants/bucketNames";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { disabledOpenAsReportConfig, UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import * as donutMeasuresIcon from "../../assets/donut/bucket-title-measures.svg";
import * as donutViewIcon from "../../assets/donut/bucket-title-view.svg";

export function setDonutChartUiConfig(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    assign(referencePointConfigured[UICONFIG], disabledOpenAsReportConfig);

    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], donutMeasuresIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.VIEW, "icon"], donutViewIcon);

    return referencePointConfigured;
}
