// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from '@gooddata/typings';
import range = require('lodash/range');

import {
    DEFAULT_COLOR_PALETTE,
    HEATMAP_BLUE_COLOR_PALETTE,
    getLighterColorFromRGB,
    isCustomPalette
} from '../utils/color';

import {
    isHeatmap,
    isOneOfTypes,
    isTreemap,
    isScatterPlot,
    isBubbleChart
} from '../utils/common';

import { VisualizationTypes } from '../../../constants/visualizationTypes';

import {
    isDerivedMeasure,
    findParentMeasureIndex
} from './chartOptionsBuilder';

import {
    IColorPalette,
    IColorMapping,
    IColorAssignment,
    IRGBColor,
    IGuidColorItem,
    RGBType,
    IColorItem,
    IMappingHeader
} from '../../../interfaces/Config';

export interface IColorStrategy {
    getColorByIndex(index: number): string;
    getColorAssignment(): IColorAssignment[];
}

function isGuidColorItem(color: IColorItem): color is IGuidColorItem {
    return (color as IGuidColorItem).type === 'guid';
}

export type HighChartColorPalette = string[];
export type MeasureGroupType = Execution.IMeasureGroupHeader['measureGroupHeader'];
export const attributeChartSupportedTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.SCATTER,
    VisualizationTypes.BUBBLE
];

export abstract class ColorStrategy implements IColorStrategy {
    protected palette: string[];
    protected colorAssignment: IColorAssignment[]; // rename to colorAssignment

    constructor(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        measureGroup: MeasureGroupType,
        viewByAttribute: any,
        stackByAttribute: any,
        afm: AFM.IAfm
    ) {
        this.colorAssignment = this.createColorMapping(
            colorPalette,
            colorMapping,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm
        );

        this.palette = this.createPalette(colorPalette, this.colorAssignment, viewByAttribute, stackByAttribute);
    }

    public getColorByIndex(index: number): string {
        return this.palette[index];
    }

    public getColorAssignment() {
        return this.colorAssignment;
    }

    protected createPalette(
            colorPalette: IColorPalette,
            colorAssignment: IColorAssignment[],
            _viewByAttribute: any,
            _stackByAttribute: any):
        string[] {
        return colorAssignment.map((map, index: number) => {
            const color = isGuidColorItem(map.color)
                ? getColorByGuid(colorPalette, map.color.value, index) : map.color.value;
            return getRgbStringFromRGB(color);
        });
    }

    protected abstract createColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        measureGroup: MeasureGroupType,
        viewByAttribute: any,
        stackByAttribute: any,
        afm: AFM.IAfm
    ): IColorAssignment[];
}

const emptyColorPaletteItem: IGuidColorItem = { type: 'guid', value: 'none' };

function getColorFromMapping(mappingHeader: IMappingHeader, colorMapping: IColorMapping[]
    ): IColorItem {
        if (!colorMapping) {
            return undefined;
        }

        const mapping = colorMapping.find(item => item.predicate(mappingHeader));
        return mapping && mapping.color;
}

export function getColorByGuid(colorPalette: IColorPalette, guid: string, index: number) {
    const inPalette = colorPalette.find((item: any) => item.guid === guid);

    return inPalette ? inPalette.fill : colorPalette[index % colorPalette.length].fill;
}

function getRgbStringFromRGB(color: IRGBColor) {
    return `rgb(${color.r},${color.g},${color.b})`;
}

export class MeasureColorStrategy extends ColorStrategy {
    protected createColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        measureGroup: MeasureGroupType,
        _viewByAttribute: any,
        _stackByAttribute: any,
        afm: AFM.IAfm
    ): IColorAssignment[] {
        const measuresColorMapping = this.mapColorsFromMeasures(measureGroup, afm, colorMapping, colorPalette);
        return this.mapColorsFromDerivedMeasure(measureGroup, afm, measuresColorMapping, colorPalette);
    }

    private mapColorsFromMeasures(
        measureGroup: MeasureGroupType,
        afm: AFM.IAfm,
        colorMapping: IColorMapping[],
        colorPalette: IColorPalette
    ): IColorAssignment[] {
        let currentColorPaletteIndex = 0;

        const colorMap = measureGroup.items.map((headerItem, index) => {
            if (isDerivedMeasure(measureGroup.items[index], afm)) {
                return {
                    headerItem,
                    color: emptyColorPaletteItem
                };
            }

            const mappedMeasure: IColorAssignment = this.mapMeasureColor(
                headerItem,
                currentColorPaletteIndex,
                colorPalette,
                colorMapping
            );

            currentColorPaletteIndex++;

            return mappedMeasure;

        });

        return colorMap;
    }

    private mapMeasureColor(
        headerItem: Execution.IMeasureHeaderItem,
        currentColorPaletteIndex: number,
        colorPalette: IColorPalette,
        colorAssignment: IColorMapping[]
    ): IColorAssignment {
        const mappedColor = getColorFromMapping(headerItem, colorAssignment);

        const color: IColorItem = mappedColor ? mappedColor :
            {
                type: 'guid',
                value: colorPalette[currentColorPaletteIndex % colorPalette.length].guid
            };

        return {
            headerItem,
            color
        };
    }

    private mapColorsFromDerivedMeasure(
        measureGroup: MeasureGroupType,
        afm: AFM.IAfm,
        measuresColorAssignment: IColorAssignment[],
        colorPalette: IColorPalette
    ): IColorAssignment[] {
        return measuresColorAssignment.map((mapItem, measureItemIndex) => {
            if (!isDerivedMeasure(measureGroup.items[measureItemIndex], afm)) {
                return mapItem;
            }
            const parentMeasureIndex = findParentMeasureIndex(afm, measureItemIndex);
            if (parentMeasureIndex > -1) {
                const sourceMeasureColor = measuresColorAssignment[parentMeasureIndex].color;
                const rgbColor = isGuidColorItem(sourceMeasureColor)
                    ? getColorByGuid(colorPalette, sourceMeasureColor.value, measureItemIndex)
                    : sourceMeasureColor.value;
                return {
                    ...mapItem,
                    color: {
                        type: 'rgb' as RGBType,
                        value: getLighterColorFromRGB(rgbColor, 0.6)
                    }
                };
            }
            return {
                ...mapItem,
                color: mapItem.color
            };
        });
    }
}

function getAttributeColorMapping(
        attribute: any,
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[]
    ): IColorAssignment[] {
    let currentColorPaletteIndex = 0;
    return attribute.items.map((headerItem: any) => {
        const mappedColor = getColorFromMapping(headerItem, colorMapping);

        const color = mappedColor ? mappedColor
            : {
                type: 'guid',
                value: colorPalette[currentColorPaletteIndex % colorPalette.length].guid
            };
        currentColorPaletteIndex++;

        return {
            headerItem,
            color
        };
    });
}

export class AttributeColorStrategy extends ColorStrategy {
    protected createColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        _measureGroup: MeasureGroupType,
        viewByAttribute: any,
        stackByAttribute: any,
        _afm: AFM.IAfm
    ): IColorAssignment[] {
        const attribute = stackByAttribute ? stackByAttribute : viewByAttribute;
        return getAttributeColorMapping(attribute, colorPalette, colorMapping);
    }
}

export class HeatmapColorStrategy extends ColorStrategy {
    public getColorByIndex(index: number): string {
        return this.palette[index % this.palette.length];
    }

    protected createColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        measureGroup: MeasureGroupType,
        _viewByAttribute: any,
        _stackByAttribute: any,
        _afm: AFM.IAfm
    ): IColorAssignment[] {
        let mappedColor;
        const headerItem = measureGroup && measureGroup.items[0];
        if (colorMapping) {
            mappedColor = getColorFromMapping(headerItem, colorMapping);
            if (mappedColor) {
                return [{
                    headerItem,
                    color: mappedColor
                }];
            }
        }

        if (colorPalette && isCustomPalette(colorPalette) && colorPalette[0]) {
            return [{
                headerItem,
                color: {
                    type: 'guid',
                    value: colorPalette[0].guid
                }
            }];
        }

        return [{
            headerItem,
            color: {
                type: 'guid',
                value: 'HEATMAP_DEFAULT'
            }
        }];
    }

    protected createPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[]
    ): string[] {
        if (isGuidColorItem(colorAssignment[0].color)) {
            if (colorAssignment[0].color.value === 'HEATMAP_DEFAULT') {
                return HEATMAP_BLUE_COLOR_PALETTE;
            }

            return this.getCustomHeatmapColorPalette(
                getColorByGuid(colorPalette, colorAssignment[0].color.value as string, 0)
            );
        }

        return this.getCustomHeatmapColorPalette(colorAssignment[0].color.value as IRGBColor);
    }

    private getCustomHeatmapColorPalette(baseColor: IRGBColor): HighChartColorPalette {
        const { r, g, b } = baseColor;
        const colorItemsCount = 6;
        const channels = [r, g, b];
        const steps = channels.map(channel => (255 - channel) / colorItemsCount);
        const generatedColors = this.getCalculatedColors(colorItemsCount, channels, steps);
        return [
            'rgb(255,255,255)',
            ...generatedColors.reverse(),
            getRgbStringFromRGB(baseColor)
        ];
    }
    private getCalculatedColors(count: number, channels: number[], steps: number[]): HighChartColorPalette {
        return range(1, count)
            .map((index: number) =>
                `rgb(${this.getCalculatedChannel(channels[0], index, steps[0])},` +
                    `${this.getCalculatedChannel(channels[1], index, steps[1])},` +
                    `${this.getCalculatedChannel(channels[2], index, steps[2])})`);
    }

    private getCalculatedChannel(channel: number, index: number, step: number): number {
        return Math.trunc(channel + index * step);
    }
}

export class TreemapColorStrategy extends MeasureColorStrategy {
    protected createColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        measureGroup: MeasureGroupType,
        viewByAttribute: any,
        stackByAttribute: any,
        afm: AFM.IAfm
    ): IColorAssignment[] {
        if (viewByAttribute) {
            return getAttributeColorMapping(viewByAttribute, colorPalette, colorMapping);
        }

        return super.createColorMapping(
            colorPalette,
            colorMapping,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm
        );
    }
}

export class PointsChartColorStrategy extends AttributeColorStrategy {
    protected singleMeasureColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        measureGroup: MeasureGroupType
    ): IColorAssignment[] {
        const measureHeaderItem = measureGroup.items[0] ? measureGroup.items[0] : measureGroup.items[1];
        const measureColorMapping = getColorFromMapping(measureHeaderItem, colorMapping);
        const color: IColorItem = measureColorMapping
            ? measureColorMapping : { type: 'guid', value: colorPalette[0].guid };
        return [{
            headerItem: measureHeaderItem,
            color
        }];
    }

    protected createSingleColorPalette(
            colorPalette: IColorPalette, colorAssignment: IColorAssignment[], viewByAttribute: any
        ): string[] {
        const length = viewByAttribute ? viewByAttribute.items.length : 1;
        const color = isGuidColorItem(colorAssignment[0].color)
            ? getColorByGuid(colorPalette, colorAssignment[0].color.value as string, 0)
            : colorAssignment[0].color.value as IRGBColor;
        const colorString = getRgbStringFromRGB(color);
        return Array(length).fill(colorString);
    }
}

export class BubbleChartColorStrategy extends PointsChartColorStrategy {
    protected createColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        measureGroup: MeasureGroupType,
        viewByAttribute: any,
        stackByAttribute: any,
        afm: AFM.IAfm
    ): IColorAssignment[] {
        if (stackByAttribute) {
            return super.createColorMapping(
                colorPalette,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm
            );
        }
        return this.singleMeasureColorMapping(colorPalette, colorMapping, measureGroup);
    }

    protected createPalette(
            colorPalette: IColorPalette,
            colorAssignment: IColorAssignment[],
            viewByAttribute: any,
            stackByAttribute: any
        ): string[] {
        if (stackByAttribute) {
            return super.createPalette(colorPalette, colorAssignment, viewByAttribute, stackByAttribute);
        }

        return super.createSingleColorPalette(colorPalette, colorAssignment, stackByAttribute);
    }
}

export class ScatterPlotColorStrategy extends PointsChartColorStrategy {
    protected createColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        measureGroup: MeasureGroupType,
        _viewByAttribute: any,
        _stackByAttribute: any,
        _afm: AFM.IAfm
    ): IColorAssignment[] {
        return this.singleMeasureColorMapping(colorPalette, colorMapping, measureGroup);
    }

    protected createPalette(
            colorPalette: IColorPalette,
            colorAssignment: IColorAssignment[],
            _viewByAttribute: any,
            stackByAttribute: any
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
        measureGroup: MeasureGroupType,
        viewByAttribute: any,
        stackByAttribute: any,
        afm: AFM.IAfm,
        type: string
    ): IColorStrategy {

        if (isHeatmap(type)) {
            return new HeatmapColorStrategy(
                colorPalette,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm);
        }

        if (isTreemap(type)) {
            return new TreemapColorStrategy(
                colorPalette,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm);
        }

        if (isScatterPlot(type)) {
            return new ScatterPlotColorStrategy(
                colorPalette,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm);
        }

        if (isBubbleChart(type)) {
            return new BubbleChartColorStrategy(
                colorPalette,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm);
        }

        if (isAttributeColorPalette(type, afm, stackByAttribute)) {
            return new AttributeColorStrategy(
                colorPalette,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm);
        }

        return new MeasureColorStrategy(
            colorPalette,
            colorMapping,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm);
    }
}
