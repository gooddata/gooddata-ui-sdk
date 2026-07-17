// (C) 2019-2026 GoodData Corporation

import { cloneDeep, compact, isEmpty, isEqual, set, uniqBy } from "lodash-es";

import {
    type IColor,
    type IColorMappingItem,
    type IMeasureDescriptor,
    isAttributeDescriptor,
    isColorDescriptor,
    isColorFromPalette,
    isMeasureDescriptor,
    isResultAttributeHeader,
    isRgbColor,
    isUriRef,
} from "@gooddata/sdk-model";
import { type IColorAssignment, type IMappingHeader, getMappingHeaderName } from "@gooddata/sdk-ui";
import { ColorUtils, type ILineStyleMappingItem } from "@gooddata/sdk-ui-charts";

import { type IColorConfiguration, type IColoredItem } from "../interfaces/Colors.js";
import { type IVisualizationProperties } from "../interfaces/Visualization.js";

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

export function getMappingHeaderId(item: IMappingHeader): string | undefined {
    if (isMeasureDescriptor(item)) {
        return getMeasureMappingIdentifier(item);
    } else if (isResultAttributeHeader(item)) {
        return item.attributeHeaderItem.uri;
    } else if (isAttributeDescriptor(item)) {
        return isUriRef(item.attributeHeader.ref)
            ? item.attributeHeader.uri
            : item.attributeHeader.identifier;
    } else if (isColorDescriptor(item)) {
        return item.colorHeaderItem.id;
    }
    return undefined;
}

export function getColoredInputItems(
    colors: IColorConfiguration | undefined,
    lineStyleMapping?: ILineStyleMappingItem[],
    colorMapping?: IColorMappingItem[],
): IColoredItem[] {
    let inputItems: (IColoredItem | undefined)[] = [];

    if (colors?.colorAssignments) {
        inputItems = colors.colorAssignments.map((assignmentItem: IColorAssignment, index: number) => {
            let base: IColoredItem | undefined;

            const isCustomMapped = colorMapping?.some(
                (entry) => entry.color && entry.id === getMappingHeaderId(assignmentItem.headerItem),
            );

            if (isColorFromPalette(assignmentItem.color)) {
                base = {
                    colorItem: assignmentItem.color,
                    mappingHeader: assignmentItem.headerItem,
                    color: ColorUtils.getColorByGuid(colors.colorPalette, assignmentItem.color.value, index),
                    isCustomMapped,
                };
            } else if (isRgbColor(assignmentItem.color)) {
                base = {
                    colorItem: assignmentItem.color,
                    mappingHeader: assignmentItem.headerItem,
                    color: assignmentItem.color.value,
                    isCustomMapped,
                };
            }

            if (base && lineStyleMapping && isMeasureDescriptor(assignmentItem.headerItem)) {
                const localId = assignmentItem.headerItem.measureHeaderItem.localIdentifier;
                const styleEntry = lineStyleMapping.find((m) => m.id === localId);
                if (styleEntry) {
                    base = {
                        ...base,
                        lineStyle: styleEntry.lineStyle,
                        lineWidth: styleEntry.lineWidth,
                    };
                }
            }

            return base;
        });
    }

    return inputItems.filter((item): item is IColoredItem => item !== undefined);
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

    const previousColorMapping = properties?.controls?.["colorMapping"] ?? [];

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
    const id = getMappingHeaderId(item);
    if (id === undefined) {
        return {};
    }
    return mergeColorMappingToProperties(properties, id, color);
}

export function removeColorMappingFromProperties(
    properties: IVisualizationProperties,
    id: string,
): IVisualizationProperties {
    const previousColorMapping: IColorMappingItem[] = properties?.controls?.["colorMapping"] ?? [];
    // a null color instructs the host application to remove the stored entry;
    // omitting the entry is not enough because hosts merge pushed properties additively
    const updatedMapping = previousColorMapping.map((item) =>
        item.id === id ? ({ id, color: null } as unknown as IColorMappingItem) : item,
    );
    const newProperties = cloneDeep(properties);
    set(newProperties, "controls.colorMapping", updatedMapping);
    return newProperties;
}

export function getLineStyleProperties(
    properties: IVisualizationProperties,
    id: string,
    lineStyle: ILineStyleMappingItem["lineStyle"],
    lineWidth: ILineStyleMappingItem["lineWidth"],
): IVisualizationProperties {
    const newEntry: ILineStyleMappingItem = { id, lineStyle, lineWidth };
    const previousMapping: ILineStyleMappingItem[] = properties?.controls?.["lineStyleMapping"] ?? [];
    const merged = compact(uniqBy([newEntry, ...previousMapping], "id"));
    const newProperties = cloneDeep(properties);
    set(newProperties, "controls.lineStyleMapping", merged);
    return newProperties;
}

export function getValidProperties(
    properties: IVisualizationProperties,
    colorAssignments: IColorAssignment[] | undefined,
): IVisualizationProperties {
    const hasColorMapping = Boolean(properties?.controls?.["colorMapping"]);
    const hasLineStyleMapping = Boolean(properties?.controls?.["lineStyleMapping"]);

    if (!hasColorMapping && !hasLineStyleMapping) {
        return properties;
    }

    const validMeasureLocalIds = new Set(
        colorAssignments
            ?.filter((a) => isMeasureDescriptor(a.headerItem))
            .map((a) => (a.headerItem as IMeasureDescriptor).measureHeaderItem.localIdentifier),
    );

    let updatedControls = { ...properties.controls };

    if (hasColorMapping) {
        const reducedColorMapping = (properties.controls?.["colorMapping"] ?? []).filter(
            (mappingItem: IColorMappingItem) => {
                if (!mappingItem.color) {
                    return false;
                }
                const { id } = mappingItem;
                const colorValue = mappingItem.color.value;

                const assignmentValid = colorAssignments?.find((colorAssignment: IColorAssignment) => {
                    if (isMeasureDescriptor(colorAssignment.headerItem)) {
                        return (
                            colorAssignment.headerItem.measureHeaderItem.localIdentifier === id &&
                            isEqual(colorAssignment.color?.value, colorValue)
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
            },
        );
        updatedControls = {
            ...updatedControls,
            colorMapping: reducedColorMapping.length ? reducedColorMapping : null,
        };
    }

    if (hasLineStyleMapping) {
        const reducedLineStyleMapping = (properties.controls?.["lineStyleMapping"] ?? []).filter(
            (mappingItem: ILineStyleMappingItem) => validMeasureLocalIds.has(mappingItem.id),
        );
        updatedControls = {
            ...updatedControls,
            lineStyleMapping: reducedLineStyleMapping.length ? reducedLineStyleMapping : null,
        };
    }

    return {
        ...properties,
        controls: updatedControls,
    };
}
