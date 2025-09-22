// (C) 2019-2025 GoodData Corporation

// eslint-disable-next-line no-restricted-imports
import { cloneDeep, flow, get, has, isEmpty, set } from "lodash-es";

import { IInsightDefinition, ISettings, bucketsIsEmpty, insightBuckets } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition, ColumnWidthItem, MeasureGroupDimension } from "@gooddata/sdk-ui-pivot";
import { ITextWrapping } from "@gooddata/sdk-ui-pivot/next";

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
import { AxisPositionType, AxisType, IAxisNameProperties } from "../interfaces/AxisType.js";
import {
    IBucketItem,
    IExtendedReferencePoint,
    IVisProps,
    IVisualizationProperties,
} from "../interfaces/Visualization.js";

export function getSupportedPropertiesControls(
    visualizationControlsProperties: IVisualizationProperties["controls"],
    supportedPropertiesList: string[],
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

export function hasColorMapping(properties: IVisualizationProperties): boolean {
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
    visualizationProperties: IVisualizationProperties,
    supportedPropertiesList: string[],
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
    const dataLabelVisibility = referencePoint.properties.controls?.["dataLabels"]?.visible;
    const stacks = getStackItems(referencePoint.buckets);

    // Initialize total labels visibility with data labels visibility value.
    // Initialize if data labels visibility is defined and total labels visibility
    // is not defined and if current chart configuration allows configuring total labels.
    if (
        !(dataLabelVisibility === null || dataLabelVisibility === undefined) &&
        (referencePoint.properties.controls?.["dataLabels"]?.totalsVisible === null ||
            referencePoint.properties.controls?.["dataLabels"]?.totalsVisible === undefined) &&
        !isStackingToPercent(referencePoint.properties) &&
        (stacks.length || isStackingMeasure(referencePoint.properties))
    ) {
        return {
            ...referencePoint,
            properties: {
                ...referencePoint.properties,
                controls: {
                    ...referencePoint.properties.controls,
                    dataLabels: {
                        ...referencePoint.properties.controls["dataLabels"],
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
    enableAxisNameConfiguration: boolean = false,
): IVisualizationProperties {
    const axisProperties: IVisualizationProperties = AXIS_TYPES.reduce(
        (result: IVisualizationProperties, axis: string) => {
            const axisNameConfig: IAxisNameProperties = controlProperties?.[axis]?.name;

            if (isEmpty(axisNameConfig)) {
                return result;
            }

            axisNameConfig.position =
                AXIS_NAME_POSITION_MAPPING[
                    enableAxisNameConfiguration ? axisNameConfig.position : AXIS_NAME_POSITION_MAPPING.auto
                ];
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
    enableHidingOfDataPoints: boolean = false,
): IVisualizationProperties {
    if (enableHidingOfDataPoints) {
        const dataPointsVisible = controlProperties["dataPoints"]?.visible;

        return {
            ...controlProperties,
            dataPoints: {
                visible: dataPointsVisible === undefined ? "auto" : dataPointsVisible,
            },
        };
    }

    return {
        ...controlProperties,
        dataPoints: {
            visible: undefined,
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
    settings: ISettings | undefined,
): IVisualizationProperties | undefined {
    return flow(
        (c) => cloneDeep<IVisualizationProperties>(c ?? {}),
        (c) => getLegendConfiguration(c, insight),
        (c) => getHighchartsAxisNameConfiguration(c, settings?.enableAxisNameConfiguration),
        (c) => getDataPointsConfiguration(c, settings?.enableHidingOfDataPoints),
    )(controlProperties);
}

export function getChartSupportedControlsDashboardsEnv(
    controlProperties: IVisualizationProperties | undefined,
    options: IVisProps,
    settings: ISettings | undefined,
): IVisualizationProperties | undefined {
    return flow(
        (c) => cloneDeep<IVisualizationProperties>(c ?? {}),
        (c) => getLegendConfigurationDashboardsEnv(c, options),
        (c) => getHighchartsAxisNameConfiguration(c, settings?.enableAxisNameConfiguration),
        (c) => getDataPointsConfiguration(c, settings?.enableHidingOfDataPoints),
    )(controlProperties);
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
    const { enablePivotTableTransposition, enableColumnHeadersPosition, enableNewPivotTable } = settings;
    const textWrapping = enableNewPivotTable ? getTextWrappingFromProperties(properties) : undefined;

    return {
        ...(enablePivotTableTransposition === true
            ? {
                  measureGroupDimension: getMeasureGroupDimensionFromProperties(properties),
              }
            : {}),
        ...(enableColumnHeadersPosition === true
            ? {
                  columnHeadersPosition: getColumnHeadersPositionFromProperties(properties),
              }
            : {}),
        ...(textWrapping ? { textWrapping } : {}),
    };
}
