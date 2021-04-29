// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { IntlShape } from "react-intl";

import { isLineChart } from "@gooddata/sdk-ui-charts";
import { BucketNames, ChartType, VisualizationTypes } from "@gooddata/sdk-ui";
import { IBucketOfFun, IExtendedReferencePoint, IUiConfig } from "../../interfaces/Visualization";
import { BUCKETS } from "../../constants/bucket";
import { getTranslation } from "../translations";
import { getBucketsByNames, setBucketTitles } from "../bucketHelper";

import columnMeasureIcon from "../../assets/combo/bucket-title-measures-column.svg";
import lineMeasureIcon from "../../assets/combo/bucket-title-measures-line.svg";
import areaMeasureIcon from "../../assets/combo/bucket-title-measures-area.svg";

import columnLineIcon from "../../assets/combo/bucket-title-view-column-line.svg";
import columnAreaIcon from "../../assets/combo/bucket-title-view-column-area.svg";
import lineAreaIcon from "../../assets/combo/bucket-title-view-line-area.svg";

import columnViewIcon from "../../assets/column/bucket-title-view.svg";
import lineViewIcon from "../../assets/combo/bucket-title-view-line-line.svg";
import areaViewIcon from "../../assets/area/bucket-title-view.svg";

import { UICONFIG } from "../../constants/uiConfig";

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
    intl: IntlShape,
    visualizationType: ChartType,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    const measureBuckets = getBucketsByNames(referencePointConfigured?.buckets, [
        BucketNames.MEASURES,
        BucketNames.SECONDARY_MEASURES,
    ]);
    const chartTypes = [
        referencePointConfigured?.properties?.controls?.primaryChartType ?? COLUMN,
        referencePointConfigured?.properties?.controls?.secondaryChartType ?? LINE,
    ];

    const updatedUiConfig: IUiConfig = setBucketTitles(referencePointConfigured, visualizationType, intl);

    const isDualAxis = referencePointConfigured?.properties?.controls?.dualAxis ?? true;
    setCanStackInPercent(updatedUiConfig, chartTypes[1], isDualAxis);

    measureBuckets.forEach((bucket: IBucketOfFun, index: number) => {
        const type = chartTypes[index];
        const localIdentifier = bucket?.localIdentifier ?? "";
        const subtitle = getTranslation(`dashboard.bucket.combo.subtitle.${type}`, intl);

        set(updatedUiConfig, [BUCKETS, localIdentifier, "subtitle"], subtitle);
        set(updatedUiConfig, [BUCKETS, localIdentifier, "icon"], MEASURE_BUCKET_ICONS[type]);
    });

    set(updatedUiConfig, [BUCKETS, BucketNames.VIEW, "icon"], VIEW_BY_ICONS[chartTypes.join("-")]);
    set(referencePointConfigured, UICONFIG, updatedUiConfig);

    return referencePointConfigured;
}
