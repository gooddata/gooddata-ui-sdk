// (C) 2019-2023 GoodData Corporation
import set from "lodash/set.js";
import isEqual from "lodash/isEqual.js";
import uniqBy from "lodash/uniqBy.js";
import isEmpty from "lodash/isEmpty.js";
import cloneDeep from "lodash/cloneDeep.js";
import compact from "lodash/compact.js";

import { IVisualizationProperties } from "../interfaces/Visualization.js";
import { IColorConfiguration, IColoredItem } from "../interfaces/Colors.js";
import {
    IColor,
    IColorMappingItem,
    isColorFromPalette,
    isRgbColor,
    IMeasureDescriptor,
    isAttributeDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
    isUriRef,
    isColorDescriptor,
} from "@gooddata/sdk-model";
import { getMappingHeaderName, IColorAssignment, IMappingHeader } from "@gooddata/sdk-ui";
import { ColorUtils } from "@gooddata/sdk-ui-charts";

function getItemName(item: IColoredItem): string {
    return getMappingHeaderName(item.mappingHeader) || "";
}

export function getSearchedItems(inputItems: IColoredItem[], searchString: string): IColoredItem[] {
    if (isEmpty(searchString)) {
        return inputItems;
    }
    return inputItems.filter((item: IColoredItem) => {
        const name = getItemName(item);
        return name.toLowerCase().includes(searchString.toLowerCase());
    });
}

export function getColoredInputItems(colors: IColorConfiguration): IColoredItem[] {
    let inputItems: IColoredItem[] = [];

    if (colors?.colorAssignments) {
        inputItems = colors.colorAssignments.map((assignmentItem: IColorAssignment, index: number) => {
            if (isColorFromPalette(assignmentItem.color)) {
                return {
                    colorItem: assignmentItem.color,
                    mappingHeader: assignmentItem.headerItem,
                    color: ColorUtils.getColorByGuid(colors.colorPalette, assignmentItem.color.value, index),
                };
            } else if (isRgbColor(assignmentItem.color)) {
                return {
                    colorItem: assignmentItem.color,
                    mappingHeader: assignmentItem.headerItem,
                    color: assignmentItem.color.value,
                };
            }

            return undefined;
        });
    }

    return inputItems;
}

function getMeasureMappingIdentifier(item: IMeasureDescriptor): string {
    return item.measureHeaderItem.localIdentifier;
}

function mergeColorMappingToProperties(properties: IVisualizationProperties, id: string, color: IColor) {
    const colorMapping: IColorMappingItem[] = [
        {
            id,
            color,
        },
    ];

    const previousColorMapping = properties?.controls?.colorMapping ?? [];

    const mergedMapping = compact(uniqBy([...colorMapping, ...previousColorMapping], "id"));
    const newProperties = cloneDeep(properties);
    set(newProperties, "controls.colorMapping", mergedMapping);

    return newProperties;
}

export function getProperties(
    properties: IVisualizationProperties,
    item: IMappingHeader,
    color: IColor,
): IVisualizationProperties {
    if (isMeasureDescriptor(item)) {
        const id = getMeasureMappingIdentifier(item);
        return mergeColorMappingToProperties(properties, id, color);
    } else if (isResultAttributeHeader(item)) {
        return mergeColorMappingToProperties(properties, item.attributeHeaderItem.uri, color);
    } else if (isAttributeDescriptor(item)) {
        const id = isUriRef(item.attributeHeader.ref)
            ? item.attributeHeader.uri
            : item.attributeHeader.identifier;
        return mergeColorMappingToProperties(properties, id, color);
    } else if (isColorDescriptor(item)) {
        return mergeColorMappingToProperties(properties, item.colorHeaderItem.id, color);
    }

    return {};
}

export function getValidProperties(
    properties: IVisualizationProperties,
    colorAssignments: IColorAssignment[],
): IVisualizationProperties {
    if (!properties?.controls?.colorMapping) {
        return properties;
    }

    const reducedColorMapping = properties.controls.colorMapping.filter((mappingItem: IColorMappingItem) => {
        const { id } = mappingItem;
        const colorValue = mappingItem.color.value;

        const assignmentValid = colorAssignments.find((colorAssignment: IColorAssignment) => {
            if (isMeasureDescriptor(colorAssignment.headerItem)) {
                return (
                    colorAssignment.headerItem.measureHeaderItem.localIdentifier === id &&
                    isEqual(colorAssignment.color.value, colorValue)
                );
            } else if (isResultAttributeHeader(colorAssignment.headerItem)) {
                return colorAssignment.headerItem.attributeHeaderItem.uri === id;
            } else if (isAttributeDescriptor(colorAssignment.headerItem)) {
                return isUriRef(colorAssignment.headerItem.attributeHeader.ref)
                    ? colorAssignment.headerItem.attributeHeader.uri === id
                    : colorAssignment.headerItem.attributeHeader.identifier === id;
            } else if (isColorDescriptor(colorAssignment.headerItem)) {
                return colorAssignment.headerItem.colorHeaderItem.id === id;
            }

            return false;
        });

        return assignmentValid !== undefined;
    });

    return {
        ...properties,
        controls: {
            ...properties.controls,
            colorMapping: reducedColorMapping.length ? reducedColorMapping : null,
        },
    };
}
