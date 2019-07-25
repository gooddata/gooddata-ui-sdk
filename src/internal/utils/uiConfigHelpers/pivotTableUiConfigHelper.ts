// (C) 2019 GoodData Corporation
import set = require("lodash/set");
import { InjectedIntl } from "react-intl";

import * as BucketNames from "../../../constants/bucketNames";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";

import { UICONFIG } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";

import { setBucketTitles } from "./../bucketHelper";

import * as tableMeasuresIcon from "../../assets/table/bucket-title-measures.svg";
import * as tableRowsIcon from "../../assets/table/bucket-title-rows.svg";
import * as tableColumnsIcon from "../../assets/table/bucket-title-columns.svg";

export function setPivotTableUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: InjectedIntl,
    visualizationType: string,
) {
    set(referencePoint, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(referencePoint, [UICONFIG, BUCKETS, BucketNames.MEASURES, "canAddItems"], true);
    set(referencePoint, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "canAddItems"], true);
    set(referencePoint, [UICONFIG, BUCKETS, BucketNames.COLUMNS, "canAddItems"], true);

    set(referencePoint, [UICONFIG, BUCKETS, BucketNames.MEASURES, "icon"], tableMeasuresIcon);
    set(referencePoint, [UICONFIG, BUCKETS, BucketNames.ATTRIBUTE, "icon"], tableRowsIcon);
    set(referencePoint, [UICONFIG, BUCKETS, BucketNames.COLUMNS, "icon"], tableColumnsIcon);
}
