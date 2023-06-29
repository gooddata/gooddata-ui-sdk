// (C) 2019-2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IntlShape } from "react-intl";

import { isLineChart } from "@gooddata/sdk-ui-charts";
import { BucketNames, ChartType, VisualizationTypes } from "@gooddata/sdk-ui";
import { IBucketOfFun, IExtendedReferencePoint, IUiConfig } from "../../interfaces/Visualization.js";
import { BUCKETS } from "../../constants/bucket.js";
import { getTranslation } from "../translations.js";
import { getBucketsByNames, setBucketTitles } from "../bucketHelper.js";
import { UICONFIG } from "../../constants/uiConfig.js";
import { messages } from "../../../locales.js";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const columnMeasureIcon = "local:combo/bucket-title-measures-column.svg";
const lineMeasureIcon = "local:combo/bucket-title-measures-line.svg";
const areaMeasureIcon = "local:combo/bucket-title-measures-area.svg";
const columnLineIcon = "local:combo/bucket-title-view-column-line.svg";
const columnAreaIcon = "local:combo/bucket-title-view-column-area.svg";
const lineAreaIcon = "local:combo/bucket-title-view-line-area.svg";
const columnViewIcon = "local:column/bucket-title-view.svg";
const lineViewIcon = "local:combo/bucket-title-view-line-line.svg";
const areaViewIcon = "local:area/bucket-title-view.svg";

const { COLUMN, LINE, AREA } = VisualizationTypes;

type VisType = "column" | "line" | "area";

const MEASURE_BUCKET_ICONS: Record<VisType, string> = {
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
    const chartTypes: VisType[] = [
        referencePointConfigured?.properties?.controls?.primaryChartType ?? COLUMN,
        referencePointConfigured?.properties?.controls?.secondaryChartType ?? LINE,
    ];

    const updatedUiConfig: IUiConfig = setBucketTitles(referencePointConfigured, visualizationType, intl);

    const isDualAxis = referencePointConfigured?.properties?.controls?.dualAxis ?? true;
    setCanStackInPercent(updatedUiConfig, chartTypes[1], isDualAxis);

    measureBuckets.forEach((bucket: IBucketOfFun, index: number) => {
        const type = chartTypes[index];
        const localIdentifier = bucket?.localIdentifier ?? "";
        const subtitle = getTranslation(messages[type].id, intl);

        set(updatedUiConfig, [BUCKETS, localIdentifier, "subtitle"], subtitle);
        set(updatedUiConfig, [BUCKETS, localIdentifier, "icon"], MEASURE_BUCKET_ICONS[type]);
    });

    set(updatedUiConfig, [BUCKETS, BucketNames.VIEW, "icon"], VIEW_BY_ICONS[chartTypes.join("-")]);
    set(referencePointConfigured, UICONFIG, updatedUiConfig);

    return referencePointConfigured;
}
