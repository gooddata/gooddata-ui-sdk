// (C) 2020 GoodData Corporation
import {
    ColorStrategy,
    ICreateColorAssignmentReturnValue,
    getColorByGuid,
    getColorFromMapping,
    getRgbStringFromRGB,
    isCustomPalette,
} from "@gooddata/sdk-ui-vis-commons";
import { IColorPalette, IRgbColorValue, isColorFromPalette, isRgbColor } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { IColorAssignment, IMappingHeader, DataViewFacade } from "@gooddata/sdk-ui";
import { findMeasureGroupInDimensions } from "../../utils/executionResultHelper";
import isEqual from "lodash/isEqual";
import range from "lodash/range";
import { DEFAULT_HEATMAP_BLUE_COLOR, HEATMAP_BLUE_COLOR_PALETTE } from "../../utils/color";

type HighChartColorPalette = string[];

export class HeatmapColorStrategy extends ColorStrategy {
    public getColorByIndex(index: number): string {
        return this.palette[index % this.palette.length];
    }

    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        _viewByAttribute: any,
        _stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        let mappedColor;
        let colorAssignment: IColorAssignment[];
        const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());
        const headerItem = measureGroup && measureGroup.items[0];
        if (colorMapping) {
            mappedColor = getColorFromMapping(headerItem, colorMapping, dv);
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
        if (isRgbColor(colorAssignment[0].color)) {
            if (isEqual(colorAssignment[0].color.value, DEFAULT_HEATMAP_BLUE_COLOR)) {
                return HEATMAP_BLUE_COLOR_PALETTE;
            }
        }

        if (isColorFromPalette(colorAssignment[0].color)) {
            return this.getCustomHeatmapColorPalette(
                getColorByGuid(colorPalette, colorAssignment[0].color.value as string, 0),
            );
        }

        return this.getCustomHeatmapColorPalette(colorAssignment[0].color.value as IRgbColorValue);
    }

    private getCustomHeatmapColorPalette(baseColor: IRgbColorValue): HighChartColorPalette {
        const { r, g, b } = baseColor;
        const colorItemsCount = 6;
        const channels = [r, g, b];
        const steps = channels.map((channel) => (255 - channel) / colorItemsCount);
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
