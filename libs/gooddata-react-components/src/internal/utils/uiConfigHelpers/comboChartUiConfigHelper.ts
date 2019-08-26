// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import get = require("lodash/get");
import { InjectedIntl } from "react-intl";

import * as BucketNames from "../../../constants/bucketNames";
import { IBucket, IExtendedReferencePoint, IUiConfig } from "../../interfaces/Visualization";
import { BUCKETS } from "../../constants/bucket";
import { getTranslation } from "../translations";
import { getBucketsByNames, setBucketTitles } from "../bucketHelper";

import * as columnMeasureIcon from "../../assets/combo/bucket-title-measures-column.svg";
import * as lineMeasureIcon from "../../assets/combo/bucket-title-measures-line.svg";
import * as areaMeasureIcon from "../../assets/combo/bucket-title-measures-area.svg";

import * as columnLineIcon from "../../assets/combo/bucket-title-view-column-line.svg";
import * as columnAreaIcon from "../../assets/combo/bucket-title-view-column-area.svg";
import * as lineAreaIcon from "../../assets/combo/bucket-title-view-line-area.svg";

import * as columnViewIcon from "../../assets/column/bucket-title-view.svg";
import * as lineViewIcon from "../../assets/combo/bucket-title-view-line-line.svg";
import * as areaViewIcon from "../../assets/area/bucket-title-view.svg";

import {
    PROPERTY_CONTROLS_PRIMARY_CHART_TYPE,
    PROPERTY_CONTROLS_SECONDARY_CHART_TYPE,
} from "../../constants/properties";
import { UICONFIG } from "../../constants/uiConfig";
import { ChartType, VisualizationTypes } from "../../../constants/visualizationTypes";
import { isLineChart } from "../../../components/visualizations/utils/common";

const { COLUMN, LINE, AREA } = VisualizationTypes;

const MEASURE_BUCKET_ICONS = {
    [COLUMN]: columnMeasureIcon,
    [LINE]: lineMeasureIcon,
    [AREA]: areaMeasureIcon,
};

const VIEW_BY_ICONS = {
    [`${COLUMN}-${COLUMN}`]: columnViewIcon,
    [`${COLUMN}-${LINE}`]: columnLineIcon,
    [`${COLUMN}-${AREA}`]: columnAreaIcon,

    [`${LINE}-${COLUMN}`]: columnLineIcon,
    [`${LINE}-${LINE}`]: lineViewIcon,
    [`${LINE}-${AREA}`]: lineAreaIcon,

    [`${AREA}-${COLUMN}`]: columnAreaIcon,
    [`${AREA}-${LINE}`]: lineAreaIcon,
    [`${AREA}-${AREA}`]: areaViewIcon,
};

function setCanStackInPercent(uiConfig: IUiConfig, secondaryChartType: string, isDualAxis: boolean) {
    const canStackInPercent = !(isDualAxis === false && isLineChart(secondaryChartType));
    set(uiConfig, "optionalStacking.canStackInPercent", canStackInPercent);
}

export function setComboChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: InjectedIntl,
    visualizationType: ChartType,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const measureBuckets: IBucket[] = getBucketsByNames(get(referencePointConfigured, BUCKETS), [
        BucketNames.MEASURES,
        BucketNames.SECONDARY_MEASURES,
    ]);
    const chartTypes = [
        get(referencePointConfigured, PROPERTY_CONTROLS_PRIMARY_CHART_TYPE, COLUMN),
        get(referencePointConfigured, PROPERTY_CONTROLS_SECONDARY_CHART_TYPE, LINE),
    ];

    const updatedUiConfig: IUiConfig = setBucketTitles(referencePointConfigured, visualizationType, intl);

    const isDualAxis = get(referencePointConfigured, "properties.controls.dualAxis", true);
    setCanStackInPercent(updatedUiConfig, chartTypes[1], isDualAxis);

    measureBuckets.forEach((bucket: IBucket, index: number) => {
        const type = chartTypes[index];
        const localIdentifier: string = get(bucket, "localIdentifier", "");
        const subtitle = getTranslation(`dashboard.bucket.combo.subtitle.${type}`, intl);

        set(updatedUiConfig, [BUCKETS, localIdentifier, "subtitle"], subtitle);
        set(updatedUiConfig, [BUCKETS, localIdentifier, "icon"], MEASURE_BUCKET_ICONS[type]);
    });

    set(updatedUiConfig, [BUCKETS, BucketNames.VIEW, "icon"], VIEW_BY_ICONS[chartTypes.join("-")]);
    set(referencePointConfigured, UICONFIG, updatedUiConfig);

    return referencePointConfigured;
}
