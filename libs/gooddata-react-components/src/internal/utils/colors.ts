// (C) 2019 GoodData Corporation
import produce from "immer";
import get = require("lodash/get");
import set = require("lodash/set");
import isEqual = require("lodash/isEqual");
import uniqBy = require("lodash/uniqBy");
import isEmpty = require("lodash/isEmpty");
import compact = require("lodash/compact");

import { Execution } from "@gooddata/typings";
import { TypeGuards, IColorItem, IColorMappingProperty } from "@gooddata/gooddata-js";
import { IVisualizationProperties } from "../interfaces/Visualization";
import { IColorConfiguration, IColoredItem } from "../interfaces/Colors";
import * as MappingHeader from "../../interfaces/MappingHeader";
import ColorUtils from "../../components/visualizations/utils/color";
import * as ChartConfiguration from "../../interfaces/Config";

function getItemName(item: IColoredItem): string {
    let name = "";

    if (MappingHeader.isMappingHeaderMeasureItem(item.mappingHeader)) {
        name = item.mappingHeader.measureHeaderItem.name;
    } else if (MappingHeader.isMappingHeaderAttributeItem(item.mappingHeader)) {
        name = item.mappingHeader.attributeHeaderItem.name;
    }

    return name || "";
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

    if (colors && colors.colorAssignments) {
        inputItems = colors.colorAssignments.map(
            (assignmentItem: ChartConfiguration.IColorAssignment, index: number) => {
                if (TypeGuards.isGuidColorItem(assignmentItem.color)) {
                    return {
                        colorItem: assignmentItem.color,
                        mappingHeader: assignmentItem.headerItem,
                        color: ColorUtils.getColorByGuid(
                            colors.colorPalette,
                            assignmentItem.color.value,
                            index,
                        ),
                    };
                } else if (TypeGuards.isRgbColorItem(assignmentItem.color)) {
                    return {
                        colorItem: assignmentItem.color,
                        mappingHeader: assignmentItem.headerItem,
                        color: assignmentItem.color.value,
                    };
                }
            },
        );
    }

    return inputItems;
}

function getMeasureMappingIdentifier(item: Execution.IMeasureHeaderItem): string {
    return item.measureHeaderItem.localIdentifier;
}

function mergeColorMappingToProperties(properties: IVisualizationProperties, id: string, color: IColorItem) {
    const colorMapping: IColorMappingProperty[] = [
        {
            id,
            color,
        },
    ];

    const previousColorMapping = get(properties, "controls.colorMapping", []);

    const mergedMapping = compact(uniqBy([...colorMapping, ...previousColorMapping], "id"));

    return produce(properties, newProperties => {
        set(newProperties, "controls.colorMapping", mergedMapping);
    });
}

export function getProperties(
    properties: IVisualizationProperties,
    item: MappingHeader.IMappingHeader,
    color: IColorItem,
): IVisualizationProperties {
    if (MappingHeader.isMappingHeaderMeasureItem(item)) {
        const id = getMeasureMappingIdentifier(item);
        const newProperties = mergeColorMappingToProperties(properties, id, color);

        return newProperties;
    } else if (MappingHeader.isMappingHeaderAttributeItem(item)) {
        return mergeColorMappingToProperties(properties, item.attributeHeaderItem.uri, color);
    }

    return {};
}

export function getValidProperties(
    properties: IVisualizationProperties,
    colorAssignments: ChartConfiguration.IColorAssignment[],
) {
    if (!properties || !properties.controls || !properties.controls.colorMapping) {
        return properties;
    }

    const reducedColorMapping = properties.controls.colorMapping.filter(
        (mappingItem: IColorMappingProperty) => {
            const { id } = mappingItem;
            const colorValue = mappingItem.color.value;

            const isMeasureInAssignment = colorAssignments.find(
                (colorAssignment: ChartConfiguration.IColorAssignment) => {
                    if (MappingHeader.isMappingHeaderMeasureItem(colorAssignment.headerItem)) {
                        return (
                            colorAssignment.headerItem.measureHeaderItem.localIdentifier === id &&
                            isEqual(colorAssignment.color.value, colorValue)
                        );
                    }

                    return false;
                },
            );

            if (isMeasureInAssignment) {
                return true;
            }

            const isAttributeInAssignment = colorAssignments.find(
                (colorAssignment: ChartConfiguration.IColorAssignment) => {
                    if (MappingHeader.isMappingHeaderAttributeItem(colorAssignment.headerItem)) {
                        return colorAssignment.headerItem.attributeHeaderItem.uri === id;
                    }

                    return false;
                },
            );

            if (isAttributeInAssignment) {
                return true;
            }
        },
    );

    return {
        ...properties,
        controls: {
            ...properties.controls,
            colorMapping: reducedColorMapping.length ? reducedColorMapping : null,
        },
    };
}
