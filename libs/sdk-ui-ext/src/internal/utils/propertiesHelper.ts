// (C) 2019-2025 GoodData Corporation

// eslint-disable-next-line no-restricted-imports
import { cloneDeep, get, has, isEmpty, set } from "lodash-es";

import { type IInsightDefinition, type ISettings, bucketsIsEmpty, insightBuckets } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import {
    type ColumnHeadersPosition,
    type ColumnWidthItem,
    type GrandTotalsPosition,
    type MeasureGroupDimension,
} from "@gooddata/sdk-ui-pivot";
import { type IPagination, type ITextWrapping } from "@gooddata/sdk-ui-pivot/next";

import {
    getAllMeasuresShowOnSecondaryAxis,
    getItemsCount,
    getItemsLocalIdentifiers,
    getMeasureItems,
    getStackItems,
} from "./bucketHelper.js";
import { AXIS } from "../constants/axis.js";
import { PROPERTY_CONTROLS } from "../constants/properties.js";
import { OPTIONAL_STACKING_PROPERTIES } from "../constants/supportedProperties.js";
import { UICONFIG_AXIS } from "../constants/uiConfig.js";
import { type AxisPositionType, type AxisType, type IAxisNameProperties } from "../interfaces/AxisType.js";
import {
    type IBucketItem,
    type IExtendedReferencePoint,
    type IVisProps,
    type IVisualizationProperties,
} from "../interfaces/Visualization.js";

export function getSupportedPropertiesControls(
    visualizationControlsProperties: IVisualizationProperties["controls"],
    supportedPropertiesList: string[] | undefined,
): IVisualizationProperties {
    const clonedControls = cloneDeep(visualizationControlsProperties);
    if (supportedPropertiesList) {
        return supportedPropertiesList.reduce(
            (props: IVisualizationProperties, current: string) =>
                has(clonedControls, current) ? set(props, current, get(clonedControls, current)) : props,
            {},
        );
    }
    return {};
}

export function hasColorMapping(properties: IVisualizationProperties | undefined): boolean {
    return !!properties?.controls?.["colorMapping"];
}

export function setSecondaryMeasures(
    referencePoint: IExtendedReferencePoint,
    axisName: AxisType,
): IExtendedReferencePoint {
    if (!axisName) {
        return referencePoint;
    }

    const newReferencePoint = cloneDeep(referencePoint);
    const path = `${PROPERTY_CONTROLS}.${axisName}`;
    const secondaryAxisProperties = newReferencePoint?.properties?.controls?.[axisName];
    const buckets = newReferencePoint?.buckets ?? [];
    const allMeasures = getMeasureItems(buckets);
    const secondaryMeasures = getAllMeasuresShowOnSecondaryAxis(buckets);

    if (!secondaryAxisProperties && !secondaryMeasures.length) {
        return referencePoint;
    }

    const secondaryAxis = {
        ...secondaryAxisProperties,
        measures: getItemsLocalIdentifiers(secondaryMeasures),
    };
    const axis: string =
        {
            0: AXIS.PRIMARY,
            [allMeasures.length]: AXIS.SECONDARY,
        }[secondaryMeasures.length] || AXIS.DUAL;

    set(newReferencePoint, path, secondaryAxis);
    set(newReferencePoint, UICONFIG_AXIS, axis);

    return newReferencePoint;
}

export function isEmptyObject(obj: object): boolean {
    return obj && Object.keys(obj).length === 0;
}

export function getSupportedProperties(
    visualizationProperties: IVisualizationProperties | undefined,
    supportedPropertiesList: string[] | undefined,
): IVisualizationProperties {
    const controls = visualizationProperties?.controls ?? {};
    const supportedControls = getSupportedPropertiesControls(controls, supportedPropertiesList);

    return isEmpty(supportedControls)
        ? {}
        : {
              controls: supportedControls,
          };
}

export function getReferencePointWithSupportedProperties(
    referencePoint: IExtendedReferencePoint,
    supportedPropertiesList: string[],
): IExtendedReferencePoint {
    const supportedControlsProperties = referencePoint.properties
        ? getSupportedPropertiesControls(referencePoint.properties.controls, supportedPropertiesList)
        : {};

    if (isEmpty(supportedControlsProperties)) {
        const sortItems = referencePoint.properties?.sortItems;
        const sortItemsExpand = sortItems && !isEmpty(sortItems) ? { sortItems } : {};

        return {
            ...referencePoint,
            properties: {
                ...sortItemsExpand,
            },
        };
    }
    const buckets = referencePoint?.buckets ?? [];
    const stackCount = getItemsCount(buckets, BucketNames.STACK);
    const stackMeasuresToPercent = Boolean(supportedControlsProperties["stackMeasuresToPercent"]);

    if (!stackCount && stackMeasuresToPercent) {
        supportedControlsProperties["stackMeasures"] = true;
    }

    return {
        ...referencePoint,
        properties: {
            ...referencePoint.properties,
            controls: supportedControlsProperties,
        },
    };
}

export function getReferencePointWithTotalLabelsInitialized(
    referencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    const properties = referencePoint.properties;
    const dataLabelVisibility = properties?.controls?.["dataLabels"]?.visible;
    const stacks = getStackItems(referencePoint.buckets);

    // Initialize total labels visibility with data labels visibility value.
    // Initialize if data labels visibility is defined and total labels visibility
    // is not defined and if current chart configuration allows configuring total labels.
    if (
        !(dataLabelVisibility === null || dataLabelVisibility === undefined) &&
        (properties?.controls?.["dataLabels"]?.totalsVisible === null ||
            properties?.controls?.["dataLabels"]?.totalsVisible === undefined) &&
        !isStackingToPercent(properties ?? {}) &&
        (stacks.length || isStackingMeasure(properties ?? {}))
    ) {
        return {
            ...referencePoint,
            properties: {
                ...properties,
                controls: {
                    ...properties?.controls,
                    dataLabels: {
                        ...properties?.controls?.["dataLabels"],
                        totalsVisible: dataLabelVisibility,
                    },
                },
            },
        };
    }

    return referencePoint;
}

export function isStackingMeasure(properties: IVisualizationProperties): boolean {
    return properties?.controls?.["stackMeasures"] ?? false;
}

export function isStackingToPercent(properties: IVisualizationProperties): boolean {
    return properties?.controls?.["stackMeasuresToPercent"] ?? false;
}

export function isTotalSectionEnabled(properties: IVisualizationProperties): boolean {
    return properties?.controls?.["total"]?.enabled ?? true;
}

export function isDualAxisOrSomeSecondaryAxisMeasure(
    extReferencePoint: IExtendedReferencePoint,
    secondaryMeasures: IBucketItem[],
): boolean {
    return (
        (extReferencePoint?.properties?.controls?.["dualAxis"] ?? true) ||
        secondaryMeasures.some((item) => item?.showOnSecondaryAxis)
    );
}

export function removeImmutableOptionalStackingProperties(
    referencePoint: IExtendedReferencePoint,
    supportedPropertiesList: string[],
): string[] {
    const buckets = referencePoint?.buckets ?? [];
    let immutableProperties: string[] = [];

    if (getItemsCount(buckets, BucketNames.MEASURES) <= 1) {
        immutableProperties = OPTIONAL_STACKING_PROPERTIES;
    }

    if (getItemsCount(buckets, BucketNames.STACK)) {
        immutableProperties = OPTIONAL_STACKING_PROPERTIES.slice(0, 1);
    }

    return supportedPropertiesList.filter(
        (property: string) =>
            !immutableProperties.some((immutableProperty: string) => immutableProperty === property),
    );
}

// mapping between AD and SDK values
const AXIS_NAME_POSITION_MAPPING: { [key in AxisPositionType]?: "low" | "middle" | "high" } = {
    auto: "middle",

    bottom: "low",
    middle: "middle",
    top: "high",

    left: "low",
    center: "middle",
    right: "high",
};

const AXIS_TYPES: string[] = ["xaxis", "yaxis", "secondary_xaxis", "secondary_yaxis"];

export function getHighchartsAxisNameConfiguration(
    controlProperties: IVisualizationProperties,
): IVisualizationProperties {
    const axisProperties: IVisualizationProperties = AXIS_TYPES.reduce(
        (result: IVisualizationProperties, axis: string) => {
            const axisNameConfig: IAxisNameProperties = controlProperties?.[axis]?.name;

            if (isEmpty(axisNameConfig)) {
                return result;
            }

            if (axisNameConfig.position) {
                axisNameConfig.position = AXIS_NAME_POSITION_MAPPING[axisNameConfig.position];
            }
            result[axis] = {
                ...controlProperties[axis],
                name: axisNameConfig,
            };

            return result;
        },
        {},
    );

    return {
        ...controlProperties,
        ...axisProperties,
    };
}

export function getDataPointsConfiguration(
    controlProperties: IVisualizationProperties,
): IVisualizationProperties {
    const dataPointsVisible = controlProperties["dataPoints"]?.visible;

    return {
        ...controlProperties,
        dataPoints: {
            visible: dataPointsVisible === undefined ? "auto" : dataPointsVisible,
        },
    };
}

export function getColumnWidthsFromProperties(
    visualizationProperties: IVisualizationProperties,
): ColumnWidthItem[] | undefined {
    return visualizationProperties?.controls?.["columnWidths"];
}

export function getTextWrappingFromProperties(
    visualizationProperties: IVisualizationProperties,
): ITextWrapping | undefined {
    return visualizationProperties?.controls?.["textWrapping"];
}

export function getGrandTotalsPositionFromProperties(
    visualizationProperties: IVisualizationProperties,
): GrandTotalsPosition | undefined {
    return visualizationProperties?.controls?.["grandTotalsPosition"];
}

export function getPaginationFromProperties(
    visualizationProperties: IVisualizationProperties,
): IPagination | undefined {
    return visualizationProperties?.controls?.["pagination"];
}

export function getPageSizeFromProperties(
    visualizationProperties: IVisualizationProperties,
): number | undefined {
    const pageSize = visualizationProperties?.controls?.["pageSize"];
    return typeof pageSize === "number" ? pageSize : undefined;
}

export function getMeasureGroupDimensionFromProperties(
    visualizationProperties: IVisualizationProperties,
): MeasureGroupDimension {
    return visualizationProperties?.controls?.["measureGroupDimension"];
}

export function getColumnHeadersPositionFromProperties(
    visualizationProperties: IVisualizationProperties,
): ColumnHeadersPosition {
    return visualizationProperties?.controls?.["columnHeadersPosition"];
}

export function getLegendConfiguration(
    controlProperties: IVisualizationProperties,
    insight: IInsightDefinition,
): IVisualizationProperties {
    const legendPosition = getLegendPosition(controlProperties, insight);
    set(controlProperties, "legend.position", legendPosition);

    return controlProperties;
}

export function getLegendConfigurationDashboardsEnv(
    controlProperties: IVisualizationProperties,
    options: IVisProps,
): IVisualizationProperties {
    const legendPosition = getLegendPositionDashboardsEnv(controlProperties, options);
    set(controlProperties, "legend.position", legendPosition);

    set(controlProperties, "legend.responsive", "autoPositionWithPopup");

    return controlProperties;
}

export function getChartSupportedControls(
    controlProperties: IVisualizationProperties | undefined,
    insight: IInsightDefinition,
): IVisualizationProperties | undefined {
    return getDataPointsConfiguration(
        getHighchartsAxisNameConfiguration(
            getLegendConfiguration(cloneDeep<IVisualizationProperties>(controlProperties ?? {}), insight),
        ),
    );
}

export function getChartSupportedControlsDashboardsEnv(
    controlProperties: IVisualizationProperties | undefined,
    options: IVisProps,
): IVisualizationProperties | undefined {
    return getDataPointsConfiguration(
        getHighchartsAxisNameConfiguration(
            getLegendConfigurationDashboardsEnv(
                cloneDeep<IVisualizationProperties>(controlProperties ?? {}),
                options,
            ),
        ),
    );
}

function getLegendPosition(controlProperties: IVisualizationProperties, insight: IInsightDefinition) {
    const legendPosition = controlProperties?.["legend"]?.position ?? "auto";
    return legendPosition === "auto" && isStacked(insight) ? "right" : legendPosition;
}

function getLegendPositionDashboardsEnv(controlProperties: IVisualizationProperties, options: IVisProps) {
    const legendPosition = controlProperties?.["legend"]?.position ?? "auto";
    const width = options.dimensions?.width;
    return width !== undefined && width <= getMaxWidthForCollapsedLegend(legendPosition)
        ? "top"
        : legendPosition;
}

function isStacked(insight: IInsightDefinition): boolean {
    return !bucketsIsEmpty(insightBuckets(insight, BucketNames.STACK, BucketNames.SEGMENT));
}

const MAX_WIDTH_FOR_COLLAPSED_LEGEND = 440;
const MAX_WIDTH_FOR_COLLAPSED_AUTO_LEGEND = 610;

function getMaxWidthForCollapsedLegend(legendPosition: string): number {
    return legendPosition === "auto" ? MAX_WIDTH_FOR_COLLAPSED_AUTO_LEGEND : MAX_WIDTH_FOR_COLLAPSED_LEGEND;
}

export function getPivotTableProperties(settings: ISettings, properties: IVisualizationProperties) {
    const { enableNewPivotTable } = settings;
    const textWrapping = enableNewPivotTable ? getTextWrappingFromProperties(properties) : undefined;

    return {
        measureGroupDimension: getMeasureGroupDimensionFromProperties(properties),
        columnHeadersPosition: getColumnHeadersPositionFromProperties(properties),
        ...(textWrapping ? { textWrapping } : {}),
    };
}
