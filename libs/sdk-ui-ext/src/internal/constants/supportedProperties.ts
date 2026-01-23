// (C) 2019-2026 GoodData Corporation

import { CalculateAs } from "@gooddata/sdk-ui-charts";

import { AXIS } from "./axis.js";
import { type HeadlineControlProperties } from "../interfaces/ControlProperties.js";

const BASE_PROPERTIES = [
    "dataLabels.visible",
    "dataLabels.totalsVisible",
    "dataLabels.style",
    "grid",
    "legend",
    "colorMapping",
    "zoomInsight",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
];

const FORECAST_PROPERTIES = ["forecast"];
const ANOMALIES_PROPERTIES = ["anomalies"];

const BASE_X_AXIS_PROPERTIES = [
    "xaxis.rotation",
    "xaxis.labelsEnabled",
    "xaxis.visible",
    "xaxis.name.visible",
    "xaxis.name.position",
];

const BASE_Y_AXIS_PROPERTIES = [
    "yaxis.rotation",
    "yaxis.labelsEnabled",
    "yaxis.visible",
    "yaxis.name.visible",
    "yaxis.name.position",
];

const BASE_PRIMARY_AXIS_PROPERTIES = [...BASE_Y_AXIS_PROPERTIES, "yaxis.min", "yaxis.max", "yaxis.format"];

const BAR_PRIMARY_AXIS_PROPERTIES = [...BASE_X_AXIS_PROPERTIES, "xaxis.min", "xaxis.max", "xaxis.format"];

const BASE_SECONDARY_AXIS_PROPERTIES = [
    "secondary_yaxis.rotation",
    "secondary_yaxis.labelsEnabled",
    "secondary_yaxis.visible",
    "secondary_yaxis.min",
    "secondary_yaxis.max",
    "secondary_yaxis.measures",
    "secondary_yaxis.name.visible",
    "secondary_yaxis.name.position",
    "secondary_yaxis.format",
];

const BAR_SECONDARY_AXIS_PROPERTIES = [
    "secondary_xaxis.rotation",
    "secondary_xaxis.labelsEnabled",
    "secondary_xaxis.visible",
    "secondary_xaxis.min",
    "secondary_xaxis.max",
    "secondary_xaxis.measures",
    "secondary_xaxis.name.visible",
    "secondary_xaxis.name.position",
    "secondary_xaxis.format",
];

export const OPTIONAL_STACKING_PROPERTIES = ["stackMeasures", "stackMeasuresToPercent"];

const CHART_TYPE_PROPERTIES = ["primaryChartType", "secondaryChartType", "dualAxis"];

export const BASE_CHART_SUPPORTED_PROPERTIES = [
    ...BASE_PROPERTIES,
    ...FORECAST_PROPERTIES,
    ...ANOMALIES_PROPERTIES,
    ...BASE_X_AXIS_PROPERTIES,
    ...BASE_PRIMARY_AXIS_PROPERTIES,
];

export const AREA_CHART_SUPPORTED_PROPERTIES = [
    ...BASE_CHART_SUPPORTED_PROPERTIES,
    ...OPTIONAL_STACKING_PROPERTIES,
    "dataPoints.visible",
    "continuousLine.enabled",
    "distinctPointShapes",
    "chartFill",
];

export const COLUMN_CHART_SUPPORTED_PROPERTIES = {
    [AXIS.PRIMARY]: [...BASE_CHART_SUPPORTED_PROPERTIES, ...OPTIONAL_STACKING_PROPERTIES, "chartFill"],
    [AXIS.SECONDARY]: [
        ...BASE_PROPERTIES,
        ...BASE_X_AXIS_PROPERTIES,
        ...BASE_SECONDARY_AXIS_PROPERTIES,
        ...OPTIONAL_STACKING_PROPERTIES,
        "chartFill",
    ],
    [AXIS.DUAL]: [
        ...BASE_CHART_SUPPORTED_PROPERTIES,
        ...BASE_SECONDARY_AXIS_PROPERTIES,
        ...OPTIONAL_STACKING_PROPERTIES,
        "chartFill",
    ],
};

export const LINE_CHART_SUPPORTED_PROPERTIES = {
    [AXIS.PRIMARY]: [
        ...BASE_CHART_SUPPORTED_PROPERTIES,
        "dataPoints.visible",
        "continuousLine.enabled",
        "distinctPointShapes",
        "thresholdMeasures",
        "thresholdExcludedMeasures",
    ],
    [AXIS.SECONDARY]: [
        ...BASE_PROPERTIES,
        ...BASE_X_AXIS_PROPERTIES,
        ...BASE_SECONDARY_AXIS_PROPERTIES,
        ...FORECAST_PROPERTIES,
        ...ANOMALIES_PROPERTIES,
        "dataPoints.visible",
        "continuousLine.enabled",
        "distinctPointShapes",
        "thresholdMeasures",
        "thresholdExcludedMeasures",
    ],
    [AXIS.DUAL]: [
        ...BASE_CHART_SUPPORTED_PROPERTIES,
        ...BASE_SECONDARY_AXIS_PROPERTIES,
        "dataPoints.visible",
        "continuousLine.enabled",
        "distinctPointShapes",
        "thresholdMeasures",
        "thresholdExcludedMeasures",
    ],
};

export const BAR_CHART_SUPPORTED_PROPERTIES = {
    [AXIS.PRIMARY]: [
        ...BASE_PROPERTIES,
        ...BASE_Y_AXIS_PROPERTIES,
        ...BAR_PRIMARY_AXIS_PROPERTIES,
        ...OPTIONAL_STACKING_PROPERTIES,
        "chartFill",
    ],
    [AXIS.SECONDARY]: [
        ...BASE_PROPERTIES,
        ...BASE_Y_AXIS_PROPERTIES,
        ...BAR_SECONDARY_AXIS_PROPERTIES,
        ...OPTIONAL_STACKING_PROPERTIES,
        "chartFill",
    ],
    [AXIS.DUAL]: [
        ...BASE_PROPERTIES,
        ...BASE_Y_AXIS_PROPERTIES,
        ...BAR_PRIMARY_AXIS_PROPERTIES,
        ...BAR_SECONDARY_AXIS_PROPERTIES,
        ...OPTIONAL_STACKING_PROPERTIES,
        "chartFill",
    ],
};

export const COMBO_CHART_SUPPORTED_PROPERTIES = {
    [AXIS.PRIMARY]: [
        ...BASE_CHART_SUPPORTED_PROPERTIES,
        ...CHART_TYPE_PROPERTIES,
        ...OPTIONAL_STACKING_PROPERTIES,
        "dataPoints.visible",
        "continuousLine.enabled",
        "distinctPointShapes",
        "thresholdMeasures",
        "thresholdExcludedMeasures",
        "chartFill",
    ],
    [AXIS.SECONDARY]: [
        ...BASE_PROPERTIES,
        ...BASE_X_AXIS_PROPERTIES,
        ...BASE_SECONDARY_AXIS_PROPERTIES,
        ...CHART_TYPE_PROPERTIES,
        ...OPTIONAL_STACKING_PROPERTIES,
        "dataPoints.visible",
        "continuousLine.enabled",
        "distinctPointShapes",
        "thresholdMeasures",
        "thresholdExcludedMeasures",
        "chartFill",
    ],
    [AXIS.DUAL]: [
        ...BASE_CHART_SUPPORTED_PROPERTIES,
        ...BASE_SECONDARY_AXIS_PROPERTIES,
        ...CHART_TYPE_PROPERTIES,
        ...OPTIONAL_STACKING_PROPERTIES,
        "dataPoints.visible",
        "continuousLine.enabled",
        "distinctPointShapes",
        "thresholdMeasures",
        "thresholdExcludedMeasures",
        "chartFill",
    ],
};

export const BUBBLE_CHART_SUPPORTED_PROPERTIES = [
    ...BASE_PROPERTIES,

    "xaxis.rotation",
    "xaxis.labelsEnabled",
    "xaxis.visible",
    "xaxis.min",
    "xaxis.max",
    "xaxis.name.visible",
    "xaxis.name.position",
    "xaxis.format",

    "yaxis.labelsEnabled",
    "yaxis.rotation",
    "yaxis.visible",
    "yaxis.min",
    "yaxis.max",
    "yaxis.name.visible",
    "yaxis.name.position",
    "yaxis.format",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
];

export const SCATTERPLOT_SUPPORTED_PROPERTIES = [
    "dataLabels.visible",
    "dataLabels.style",
    "legend",
    "grid",
    "xaxis.rotation",
    "xaxis.labelsEnabled",
    "xaxis.visible",
    "xaxis.min",
    "xaxis.max",
    "xaxis.name.visible",
    "xaxis.name.position",
    "xaxis.format",

    "yaxis.labelsEnabled",
    "yaxis.rotation",
    "yaxis.visible",
    "yaxis.min",
    "yaxis.max",
    "yaxis.name.visible",
    "yaxis.name.position",
    "colorMapping",
    "zoomInsight",
    "yaxis.format",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "clustering.enabled",
    "clustering.numberOfClusters",
    "clustering.threshold",
    "chartConfigOverride",
];

export const PIECHART_SUPPORTED_PROPERTIES = [
    "dataLabels.visible",
    "dataLabels.style",
    "legend",
    "colorMapping",
    "chart.verticalAlign",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
    "chartFill",
];

export const FUNNELCHART_SUPPORTED_PROPERTIES = [
    "dataLabels.visible",
    "dataLabels.style",
    "dataLabels.percentsVisible",
    "legend",
    "colorMapping",
    "chart.verticalAlign",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
    "chartFill",
];

export const TREEMAP_SUPPORTED_PROPERTIES = [
    "dataLabels.visible",
    "dataLabels.style",
    "legend",
    "colorMapping",
    "zoomInsight",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
    "chartFill",
];

export const HEATMAP_SUPPORTED_PROPERTIES = [
    "dataLabels.visible",
    "dataLabels.style",
    "legend",
    "yaxis.rotation",
    "yaxis.labelsEnabled",
    "yaxis.visible",
    "yaxis.name.visible",
    "yaxis.name.position",

    "xaxis.labelsEnabled",
    "xaxis.rotation",
    "xaxis.visible",
    "xaxis.name.visible",
    "xaxis.name.position",
    "colorMapping",
    "zoomInsight",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
];

export const BULLET_CHART_SUPPORTED_PROPERTIES = [
    "grid",
    "xaxis.rotation",
    "xaxis.labelsEnabled",
    "xaxis.visible",
    "xaxis.min",
    "xaxis.max",
    "xaxis.name.visible",
    "xaxis.name.position",
    "xaxis.format",

    "yaxis.rotation",
    "yaxis.labelsEnabled",
    "yaxis.visible",
    "yaxis.name.visible",
    "yaxis.name.position",

    "legend",
    "colorMapping",
    "zoomInsight",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
    "chartFill",
];

export const GEOPUSHPIN_SUPPORTED_PROPERTIES = [
    "tooltipText",
    "latitude",
    "longitude",
    "legend",
    "tileset",
    "points.groupNearbyPoints",
    "points.minSize",
    "points.maxSize",
    "viewport.area",
    "colorMapping",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
];

/**
 * Next-gen GeoChartNext-based pushpin chart resolves tooltip text internally
 * (default display form of the location/coordinate attribute), so we must not
 * persist or accept `tooltipText` in visualization properties.
 *
 * Legacy pushpin chart still relies on `tooltipText` and therefore keeps it in
 * {@link GEOPUSHPIN_SUPPORTED_PROPERTIES}.
 */
export const GEOPUSHPIN_NEXT_SUPPORTED_PROPERTIES = GEOPUSHPIN_SUPPORTED_PROPERTIES.filter(
    (p) => p !== "tooltipText",
);

export const GEOAREA_SUPPORTED_PROPERTIES = [
    "legend",
    "tileset",
    "viewport.area",
    "colorMapping",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
];

export const PIVOT_TABLE_SUPPORTED_PROPERTIES = [
    "columnWidths",
    "measureGroupDimension",
    "columnHeadersPosition",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
];

export const PIVOT_TABLE_NEXT_SUPPORTED_PROPERTIES = [
    "columnWidths",
    "measureGroupDimension",
    "columnHeadersPosition",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
    "textWrapping",
    "pagination",
    "pageSize",
];

export const SANKEY_CHART_SUPPORTED_PROPERTIES = [
    "dataLabels.visible",
    "dataLabels.style",
    "legend",
    "colorMapping",
    "disableDrillDown",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
    "chartConfigOverride",
];

const WATERFALL_PRIMARY_X_AXIS_PROPERTIES = [
    ...BASE_X_AXIS_PROPERTIES,
    "xaxis.min",
    "xaxis.max",
    "xaxis.format",
    "chartConfigOverride",
    "chartFill",
];

export const WATERFALL_CHART_SUPPORTED_PROPERTIES = [
    ...BASE_CHART_SUPPORTED_PROPERTIES,
    ...WATERFALL_PRIMARY_X_AXIS_PROPERTIES,
    "total.enabled",
    "total.name",
    "total.measures",
    "orientation.position",
    "chartFill",
];

export const REPEATER_SUPPORTER_PROPERTIES_LIST = [
    "columnWidths",
    "colorMapping",
    "rowHeight",
    "cellVerticalAlign",
    "cellTextWrapping",
    "cellImageSizing",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
];

export const HEADLINE_SUPPORTED_PROPERTIES = [
    "comparison",
    "disableAlerts",
    "disableScheduledExports",
    "disableKeyDriveAnalysis",
    "disableKeyDriveAnalysisOn",
];

export const HEADLINE_DEFAULT_CONTROL_PROPERTIES: HeadlineControlProperties = {
    comparison: {
        enabled: true,
    },
};

export const HEADLINE_DEFAULT_MIGRATION_CONTROL_PROPERTIES: HeadlineControlProperties = {
    comparison: {
        enabled: true,
        calculationType: CalculateAs.CHANGE,
        format: "#,##0%",
        colorConfig: {
            disabled: true,
        },
    },
};
