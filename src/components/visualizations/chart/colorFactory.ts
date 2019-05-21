// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { TypeGuards, IColor, IColorItem, IGuidColorItem, RGBType } from "@gooddata/gooddata-js";
import range = require("lodash/range");
import uniqBy = require("lodash/uniqBy");
import isEqual = require("lodash/isEqual");

import {
    DEFAULT_COLOR_PALETTE,
    HEATMAP_BLUE_COLOR_PALETTE,
    getLighterColorFromRGB,
    isCustomPalette,
    getColorByGuid,
    getRgbStringFromRGB,
    getColorFromMapping,
    DEFAULT_HEATMAP_BLUE_COLOR,
} from "../utils/color";
import { isHeatmap, isOneOfTypes, isTreemap, isScatterPlot, isBubbleChart } from "../utils/common";
import { VisualizationTypes } from "../../../constants/visualizationTypes";
import { isDerivedMeasure, findParentMeasureIndex } from "./chartOptionsBuilder";
import {
    IColorPalette,
    IColorMapping,
    IColorAssignment,
    IColorPaletteItem,
} from "../../../interfaces/Config";
import { IMappingHeader } from "../../../interfaces/MappingHeader";
import { findMeasureGroupInDimensions } from "../../../helpers/executionResultHelper";

export interface IColorStrategy {
    getColorByIndex(index: number): string;
    getColorAssignment(): IColorAssignment[];
    getFullColorAssignment(): IColorAssignment[];
}

export interface ICreateColorAssignmentReturnValue {
    fullColorAssignment: IColorAssignment[];
    outputColorAssignment?: IColorAssignment[];
}

export type HighChartColorPalette = string[];
export const attributeChartSupportedTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.SCATTER,
    VisualizationTypes.BUBBLE,
];

export abstract class ColorStrategy implements IColorStrategy {
    protected palette: string[];
    protected fullColorAssignment: IColorAssignment[];
    protected outputColorAssignment: IColorAssignment[];

    constructor(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ) {
        const { fullColorAssignment, outputColorAssignment } = this.createColorAssignment(
            colorPalette,
            colorMapping,
            viewByAttribute,
            stackByAttribute,
            executionResponse,
            afm,
        );
        this.fullColorAssignment = fullColorAssignment;
        this.outputColorAssignment = outputColorAssignment ? outputColorAssignment : fullColorAssignment;

        this.palette = this.createPalette(
            colorPalette,
            this.fullColorAssignment,
            viewByAttribute,
            stackByAttribute,
        );
    }

    public getColorByIndex(index: number): string {
        return this.palette[index];
    }

    public getColorAssignment() {
        return this.outputColorAssignment;
    }

    public getFullColorAssignment() {
        return this.fullColorAssignment;
    }

    protected createPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        _viewByAttribute: any,
        _stackByAttribute: any,
    ): string[] {
        return colorAssignment.map((map, index: number) => {
            const color = TypeGuards.isGuidColorItem(map.color)
                ? getColorByGuid(colorPalette, map.color.value, index)
                : map.color.value;
            return getRgbStringFromRGB(color);
        });
    }

    protected abstract createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ): ICreateColorAssignmentReturnValue;
}

const emptyColorPaletteItem: IGuidColorItem = { type: "guid", value: "none" };

export class MeasureColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        _viewByAttribute: any,
        _stackByAttribute: any,
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ): ICreateColorAssignmentReturnValue {
        const { allMeasuresAssignment, nonDerivedMeasuresAssignment } = this.mapColorsFromMeasures(
            executionResponse,
            afm,
            colorMapping,
            colorPalette,
        );

        return {
            fullColorAssignment: this.mapColorsFromDerivedMeasure(
                executionResponse,
                afm,
                allMeasuresAssignment,
                colorPalette,
            ),
            outputColorAssignment: nonDerivedMeasuresAssignment,
        };
    }

    private mapColorsFromMeasures(
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
        colorMapping: IColorMapping[],
        colorPalette: IColorPalette,
    ): { allMeasuresAssignment: IColorAssignment[]; nonDerivedMeasuresAssignment: IColorAssignment[] } {
        let currentColorPaletteIndex = 0;

        const nonDerivedMeasuresAssignment: IColorAssignment[] = [];
        const measureGroup = findMeasureGroupInDimensions(executionResponse.dimensions);
        const allMeasuresAssignment = measureGroup.items.map((headerItem, index) => {
            if (isDerivedMeasure(measureGroup.items[index], afm)) {
                return {
                    headerItem,
                    color: emptyColorPaletteItem,
                };
            }

            const mappedMeasure: IColorAssignment = this.mapMeasureColor(
                headerItem,
                currentColorPaletteIndex,
                colorPalette,
                colorMapping,
                executionResponse,
                afm,
            );

            currentColorPaletteIndex++;
            nonDerivedMeasuresAssignment.push(mappedMeasure);

            return mappedMeasure;
        });

        return {
            allMeasuresAssignment,
            nonDerivedMeasuresAssignment,
        };
    }

    private mapMeasureColor(
        headerItem: Execution.IMeasureHeaderItem,
        currentColorPaletteIndex: number,
        colorPalette: IColorPalette,
        colorAssignment: IColorMapping[],
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ): IColorAssignment {
        const mappedColor = getColorFromMapping(headerItem, colorAssignment, executionResponse, afm);

        const color: IColorItem = isValidMappedColor(mappedColor, colorPalette)
            ? mappedColor
            : {
                  type: "guid",
                  value: colorPalette[currentColorPaletteIndex % colorPalette.length].guid,
              };

        return {
            headerItem,
            color,
        };
    }

    private mapColorsFromDerivedMeasure(
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
        measuresColorAssignment: IColorAssignment[],
        colorPalette: IColorPalette,
    ): IColorAssignment[] {
        return measuresColorAssignment.map((mapItem, measureItemIndex) => {
            const measureGroup = findMeasureGroupInDimensions(executionResponse.dimensions);
            if (!isDerivedMeasure(measureGroup.items[measureItemIndex], afm)) {
                return mapItem;
            }
            const parentMeasureIndex = findParentMeasureIndex(afm, measureItemIndex);
            if (parentMeasureIndex > -1) {
                const sourceMeasureColor = measuresColorAssignment[parentMeasureIndex].color;
                return this.getDerivedMeasureColorAssignment(
                    sourceMeasureColor,
                    colorPalette,
                    measureItemIndex,
                    mapItem,
                );
            }
            return {
                ...mapItem,
                color: mapItem.color,
            };
        });
    }

    private getDerivedMeasureColorAssignment(
        sourceMeasureColor: IColorItem,
        colorPalette: IColorPalette,
        measureItemIndex: number,
        mapItem: IColorAssignment,
    ) {
        const rgbColor = TypeGuards.isGuidColorItem(sourceMeasureColor)
            ? getColorByGuid(colorPalette, sourceMeasureColor.value, measureItemIndex)
            : sourceMeasureColor.value;
        return {
            ...mapItem,
            color: {
                type: "rgb" as RGBType,
                value: getLighterColorFromRGB(rgbColor, 0.6),
            },
        };
    }
}

function getAtributeColorAssignment(
    attribute: any,
    colorPalette: IColorPalette,
    colorMapping: IColorMapping[],
    executionResponse: Execution.IExecutionResponse,
    afm: AFM.IAfm,
): IColorAssignment[] {
    let currentColorPaletteIndex = 0;
    const uniqItems: Execution.IResultAttributeHeaderItem[] = uniqBy<Execution.IResultAttributeHeaderItem>(
        attribute.items,
        "attributeHeaderItem.uri",
    );

    return uniqItems.map(headerItem => {
        const mappedColor = getColorFromMapping(headerItem, colorMapping, executionResponse, afm);

        const color: IColorItem = isValidMappedColor(mappedColor, colorPalette)
            ? mappedColor
            : {
                  type: "guid",
                  value: colorPalette[currentColorPaletteIndex % colorPalette.length].guid,
              };
        currentColorPaletteIndex++;

        return {
            headerItem,
            color,
        };
    });
}

export function isValidMappedColor(colorItem: IColorItem, colorPalette: IColorPalette) {
    if (!colorItem) {
        return false;
    }

    if (colorItem.type === "guid") {
        return isColorItemInPalette(colorItem, colorPalette);
    }

    return true;
}

function isColorItemInPalette(colorItem: IColorItem, colorPalette: IColorPalette) {
    return colorPalette.some((paletteItem: IColorPaletteItem) => {
        return colorItem.type === "guid" && colorItem.value === paletteItem.guid;
    });
}

export class AttributeColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ): ICreateColorAssignmentReturnValue {
        const attribute = stackByAttribute ? stackByAttribute : viewByAttribute;
        const colorAssignment = getAtributeColorAssignment(
            attribute,
            colorPalette,
            colorMapping,
            executionResponse,
            afm,
        );
        return {
            fullColorAssignment: colorAssignment,
        };
    }
}

export class HeatmapColorStrategy extends ColorStrategy {
    public getColorByIndex(index: number): string {
        return this.palette[index % this.palette.length];
    }

    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        _viewByAttribute: any,
        _stackByAttribute: any,
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ): ICreateColorAssignmentReturnValue {
        let mappedColor;
        let colorAssignment: IColorAssignment[];
        const measureGroup = findMeasureGroupInDimensions(executionResponse.dimensions);
        const headerItem = measureGroup && measureGroup.items[0];
        if (colorMapping) {
            mappedColor = getColorFromMapping(headerItem, colorMapping, executionResponse, afm);
            if (mappedColor) {
                colorAssignment = [
                    {
                        headerItem,
                        color: mappedColor,
                    },
                ];
            }
        }

        colorAssignment = colorAssignment || this.getDefaultColorAssignment(colorPalette, headerItem);

        return {
            fullColorAssignment: colorAssignment,
            outputColorAssignment: colorAssignment,
        };
    }

    protected createPalette(colorPalette: IColorPalette, colorAssignment: IColorAssignment[]): string[] {
        if (TypeGuards.isRgbColorItem(colorAssignment[0].color)) {
            if (isEqual(colorAssignment[0].color.value, DEFAULT_HEATMAP_BLUE_COLOR)) {
                return HEATMAP_BLUE_COLOR_PALETTE;
            }
        }

        if (TypeGuards.isGuidColorItem(colorAssignment[0].color)) {
            return this.getCustomHeatmapColorPalette(
                getColorByGuid(colorPalette, colorAssignment[0].color.value as string, 0),
            );
        }

        return this.getCustomHeatmapColorPalette(colorAssignment[0].color.value as IColor);
    }

    private getCustomHeatmapColorPalette(baseColor: IColor): HighChartColorPalette {
        const { r, g, b } = baseColor;
        const colorItemsCount = 6;
        const channels = [r, g, b];
        const steps = channels.map(channel => (255 - channel) / colorItemsCount);
        const generatedColors = this.getCalculatedColors(colorItemsCount, channels, steps);
        return ["rgb(255,255,255)", ...generatedColors.reverse(), getRgbStringFromRGB(baseColor)];
    }
    private getCalculatedColors(count: number, channels: number[], steps: number[]): HighChartColorPalette {
        return range(1, count).map(
            (index: number) =>
                `rgb(${this.getCalculatedChannel(channels[0], index, steps[0])},` +
                `${this.getCalculatedChannel(channels[1], index, steps[1])},` +
                `${this.getCalculatedChannel(channels[2], index, steps[2])})`,
        );
    }

    private getCalculatedChannel(channel: number, index: number, step: number): number {
        return Math.trunc(channel + index * step);
    }

    private getDefaultColorAssignment(
        colorPalette: IColorPalette,
        headerItem: IMappingHeader,
    ): IColorAssignment[] {
        const hasCustomPaletteWithColors = colorPalette && isCustomPalette(colorPalette) && colorPalette[0];
        if (hasCustomPaletteWithColors) {
            return [
                {
                    headerItem,
                    color: {
                        type: "guid",
                        value: colorPalette[0].guid,
                    },
                },
            ];
        }

        return [
            {
                headerItem,
                color: {
                    type: "rgb",
                    value: DEFAULT_HEATMAP_BLUE_COLOR,
                },
            },
        ];
    }
}

export class TreemapColorStrategy extends MeasureColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ): ICreateColorAssignmentReturnValue {
        let colorAssignment: IColorAssignment[];
        if (viewByAttribute) {
            colorAssignment = getAtributeColorAssignment(
                viewByAttribute,
                colorPalette,
                colorMapping,
                executionResponse,
                afm,
            );
        } else {
            const result = super.createColorAssignment(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                executionResponse,
                afm,
            );
            colorAssignment = result.outputColorAssignment;
        }

        return {
            fullColorAssignment: colorAssignment,
            outputColorAssignment: colorAssignment,
        };
    }
}

export class PointsChartColorStrategy extends AttributeColorStrategy {
    protected singleMeasureColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ): IColorAssignment[] {
        const measureGroup = findMeasureGroupInDimensions(executionResponse.dimensions);
        const measureHeaderItem = measureGroup.items[0];
        const measureColorMapping = getColorFromMapping(
            measureHeaderItem,
            colorMapping,
            executionResponse,
            afm,
        );
        const color: IColorItem = isValidMappedColor(measureColorMapping, colorPalette)
            ? measureColorMapping
            : { type: "guid", value: colorPalette[0].guid };
        return [
            {
                headerItem: measureHeaderItem,
                color,
            },
        ];
    }

    protected createSingleColorPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        viewByAttribute: any,
    ): string[] {
        const length = viewByAttribute ? viewByAttribute.items.length : 1;
        const color = TypeGuards.isGuidColorItem(colorAssignment[0].color)
            ? getColorByGuid(colorPalette, colorAssignment[0].color.value as string, 0)
            : (colorAssignment[0].color.value as IColor);
        const colorString = getRgbStringFromRGB(color);
        return Array(length).fill(colorString);
    }
}

export class BubbleChartColorStrategy extends PointsChartColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ): ICreateColorAssignmentReturnValue {
        let colorAssignment;
        if (stackByAttribute) {
            colorAssignment = super.createColorAssignment(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                executionResponse,
                afm,
            ).fullColorAssignment;
        } else {
            colorAssignment = this.singleMeasureColorMapping(
                colorPalette,
                colorMapping,
                executionResponse,
                afm,
            );
        }

        return {
            fullColorAssignment: colorAssignment,
        };
    }

    protected createPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        viewByAttribute: any,
        stackByAttribute: any,
    ): string[] {
        if (stackByAttribute) {
            return super.createPalette(colorPalette, colorAssignment, viewByAttribute, stackByAttribute);
        }

        return super.createSingleColorPalette(colorPalette, colorAssignment, stackByAttribute);
    }
}

export class ScatterPlotColorStrategy extends PointsChartColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        _viewByAttribute: any,
        _stackByAttribute: any,
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
    ): ICreateColorAssignmentReturnValue {
        const colorAssignment = this.singleMeasureColorMapping(
            colorPalette,
            colorMapping,
            executionResponse,
            afm,
        );
        return {
            fullColorAssignment: colorAssignment,
        };
    }

    protected createPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        _viewByAttribute: any,
        stackByAttribute: any,
    ): string[] {
        return super.createSingleColorPalette(colorPalette, colorAssignment, stackByAttribute);
    }
}

export function isAttributeColorPalette(type: string, afm: AFM.IAfm, stackByAttribute: any) {
    const attributeChartSupported = isOneOfTypes(type, attributeChartSupportedTypes);
    return stackByAttribute || (attributeChartSupported && afm.attributes && afm.attributes.length > 0);
}

export class ColorFactory {
    public static getColorStrategy(
        colorPalette: IColorPalette = DEFAULT_COLOR_PALETTE,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        executionResponse: Execution.IExecutionResponse,
        afm: AFM.IAfm,
        type: string,
    ): IColorStrategy {
        if (isHeatmap(type)) {
            return new HeatmapColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                executionResponse,
                afm,
            );
        }

        if (isTreemap(type)) {
            return new TreemapColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                executionResponse,
                afm,
            );
        }

        if (isScatterPlot(type)) {
            return new ScatterPlotColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                executionResponse,
                afm,
            );
        }

        if (isBubbleChart(type)) {
            return new BubbleChartColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                executionResponse,
                afm,
            );
        }

        if (isAttributeColorPalette(type, afm, stackByAttribute)) {
            return new AttributeColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                executionResponse,
                afm,
            );
        }

        return new MeasureColorStrategy(
            colorPalette,
            colorMapping,
            viewByAttribute,
            stackByAttribute,
            executionResponse,
            afm,
        );
    }
}
