// (C) 2019-2020 GoodData Corporation
import get = require("lodash/get");
import has = require("lodash/has");
import set = require("lodash/set");
import keys = require("lodash/keys");
import isEmpty = require("lodash/isEmpty");
import cloneDeep = require("lodash/cloneDeep");
import { IExtendedReferencePoint, IVisualizationProperties, IBucketItem } from "../interfaces/Visualization";
import { BucketNames } from "@gooddata/sdk-ui";
import { AXIS } from "../constants/axis";
import {
    getItemsCount,
    getItemsLocalIdentifiers,
    getMeasureItems,
    getAllMeasuresShowOnSecondaryAxis,
} from "./bucketHelper";
import { BUCKETS, SHOW_ON_SECONDARY_AXIS } from "../constants/bucket";
import { PROPERTY_CONTROLS, PROPERTY_CONTROLS_DUAL_AXIS } from "../constants/properties";
import { UICONFIG_AXIS } from "../constants/uiConfig";
import { AxisType, IAxisNameProperties } from "../interfaces/AxisType";
import { OPTIONAL_STACKING_PROPERTIES } from "../constants/supportedProperties";

export function getSupportedPropertiesControls(
    visualizationControlsProperties: any,
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

export function hasColorMapping(properties: IVisualizationProperties) {
    return !!get(properties, ["controls", "colorMapping"]);
}

export function setSecondaryMeasures(referencePoint: IExtendedReferencePoint, axisName: AxisType) {
    if (!axisName) {
        return referencePoint;
    }

    const newReferencePoint = cloneDeep(referencePoint);
    const path = `${PROPERTY_CONTROLS}.${axisName}`;
    const secondaryAxisProperties = get(newReferencePoint, path);
    const buckets = get(newReferencePoint, BUCKETS, []);
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

export function isEmptyObject(obj: object) {
    return obj && keys(obj).length === 0;
}

export function getSupportedProperties(
    visualizationProperties: IVisualizationProperties,
    supportedPropertiesList: string[],
): IVisualizationProperties {
    // TODO: remove the need to have properties content wrapper in yet another 'properties' object
    const controls = get(visualizationProperties, "properties.controls", {});
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
        const sortItems = referencePoint.properties && referencePoint.properties.sortItems;
        const sortItemsExpand = sortItems && !isEmpty(sortItems) ? { sortItems } : {};

        return {
            ...referencePoint,
            properties: {
                ...sortItemsExpand,
            },
        };
    }
    const buckets = get(referencePoint, BUCKETS, []);
    const stackCount = getItemsCount(buckets, BucketNames.STACK);
    const stackMeasuresToPercent = Boolean(supportedControlsProperties.stackMeasuresToPercent);

    if (!stackCount && stackMeasuresToPercent) {
        supportedControlsProperties.stackMeasures = true;
    }

    return {
        ...referencePoint,
        properties: {
            ...referencePoint.properties,
            controls: supportedControlsProperties,
        },
    };
}

export function isStackingMeasure(properties: IVisualizationProperties) {
    return get(properties, ["controls", "stackMeasures"], false);
}

export function isStackingToPercent(properties: IVisualizationProperties) {
    return get(properties, ["controls", "stackMeasuresToPercent"], false);
}

export function isDualAxisOrSomeSecondaryAxisMeasure(
    extReferencePoint: IExtendedReferencePoint,
    secondaryMeasures: IBucketItem[],
): boolean {
    return (
        get(extReferencePoint, PROPERTY_CONTROLS_DUAL_AXIS, true) ||
        secondaryMeasures.some((item) => get(item, SHOW_ON_SECONDARY_AXIS))
    );
}

export function removeImmutableOptionalStackingProperties(
    referencePoint: IExtendedReferencePoint,
    supportedPropertiesList: string[],
) {
    const buckets = get(referencePoint, BUCKETS, []);
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
const AXIS_NAME_POSITION_MAPPING = {
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
            const axisNameConfig: IAxisNameProperties = get(controlProperties, `${axis}.name`);

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
