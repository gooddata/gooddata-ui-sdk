// (C) 2020-2022 GoodData Corporation
import range from "lodash/range.js";
import isEmpty from "lodash/isEmpty.js";
import isFinite from "lodash/isFinite.js";
import {
    DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
    DEFAULT_PUSHPIN_COLOR_OPACITY,
    DEFAULT_PUSHPIN_COLOR_SCALE,
} from "./constants/geoChart.js";
import { IPushpinColor } from "../../GeoChart.js";
import { getColorPalette, rgbToRgba } from "./helpers/geoChart/colors.js";
import { isAttributeDescriptor, isResultAttributeHeader } from "@gooddata/sdk-model";
import { getMinMax } from "./helpers/geoChart/common.js";
import { IColorLegendItem, IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

const DEFAULT_SEGMENT_ITEM = "default_segment_item";
const DEFAULT_COLOR_INDEX_IN_PALETTE = DEFAULT_PUSHPIN_COLOR_SCALE - 1;

export function getColorIndexInPalette(value: number | null, min: number, max: number): number {
    if (value === null || !isFinite(value) || min === max || value === min) {
        return 0;
    }

    if (value === max) {
        return DEFAULT_COLOR_INDEX_IN_PALETTE;
    }

    const step = (max - min) / DEFAULT_PUSHPIN_COLOR_SCALE;
    for (let i = 0, offset = min; i < DEFAULT_PUSHPIN_COLOR_SCALE; i++, offset += step) {
        if (offset >= value) {
            return i;
        }
    }

    return DEFAULT_COLOR_INDEX_IN_PALETTE;
}

type ColorPaletteMapping = { [itemName: string]: string[] };

export function getColorPaletteMapping(colorStrategy: IColorStrategy): ColorPaletteMapping {
    const colorAssignment = colorStrategy.getColorAssignment();

    return colorAssignment.reduce((result: ColorPaletteMapping, item, index): ColorPaletteMapping => {
        const color = colorStrategy.getColorByIndex(index);
        const colorPalette = getColorPalette(color, DEFAULT_PUSHPIN_COLOR_OPACITY);
        // color base on Location
        if (isAttributeDescriptor(item.headerItem)) {
            return {
                [DEFAULT_SEGMENT_ITEM]: colorPalette,
            };
        }
        // color base on SegmentBy
        const name = isResultAttributeHeader(item.headerItem)
            ? item.headerItem.attributeHeaderItem.name
            : DEFAULT_SEGMENT_ITEM;

        result[name ?? DEFAULT_SEGMENT_ITEM] = colorPalette;
        return result;
    }, {});
}

/**
 * Return RGB border and background colors base on color and segment values
 *
 * Example:
 * ```
 *  [any-number] => [{
 *       border: "rgb(127,224,198)",
 *       background: "rgb(215,242,250)",
 *  }]
 * ```
 */
export function getPushpinColors(
    colorValues: Array<number | null>,
    segmentValues: string[] = [],
    colorStrategy: IColorStrategy,
): IPushpinColor[] {
    const defaultColorValue = colorStrategy.getColorByIndex(0);
    const defaultColor = rgbToRgba(defaultColorValue, DEFAULT_PUSHPIN_COLOR_OPACITY);

    if (!colorValues.length && !segmentValues.length) {
        return [
            {
                border: DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
                background: defaultColor,
            },
        ];
    }

    const segmentNames: string[] = [...segmentValues];
    const colorPaletteMapping: ColorPaletteMapping = getColorPaletteMapping(colorStrategy);
    if (!colorValues.length) {
        return segmentNames.map((name: string): IPushpinColor => {
            const palette = colorPaletteMapping[name];
            return {
                border: DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
                background: palette[DEFAULT_COLOR_INDEX_IN_PALETTE],
            };
        });
    }

    const colorsWithoutNull = colorValues.filter((value) => value !== null && isFinite(value)) as number[];
    const { min, max } = getMinMax(colorsWithoutNull);

    if (min === max && !segmentValues.length) {
        return [
            {
                border: DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
                background: defaultColor,
            },
        ];
    }

    return colorValues.map((color: number | null, index: number): IPushpinColor => {
        const value = color !== null && isFinite(color) ? color : min;
        const colorIndex = getColorIndexInPalette(value!, min!, max!);
        const segmentItemName = segmentNames[index] || DEFAULT_SEGMENT_ITEM;
        const palette = colorPaletteMapping[segmentItemName];

        return {
            border: palette[DEFAULT_COLOR_INDEX_IN_PALETTE],
            background: palette[colorIndex],
        };
    });
}

export function generateLegendColorData(colorSeries: number[], colorString: string): IColorLegendItem[] {
    if (isEmpty(colorSeries)) {
        return [];
    }
    const colorPalette = getColorPalette(colorString, DEFAULT_PUSHPIN_COLOR_OPACITY);
    const min = Math.min(...colorSeries);
    const max = Math.max(...colorSeries);
    const offset = (max - min) / DEFAULT_PUSHPIN_COLOR_SCALE;

    if (min === max) {
        return [];
    }

    return range(0, DEFAULT_PUSHPIN_COLOR_SCALE).map((index: number): IColorLegendItem => {
        const from = min + offset * index;
        const isLastItem = index === DEFAULT_PUSHPIN_COLOR_SCALE - 1;
        const to = isLastItem ? max : from + offset;
        const range = {
            from,
            to,
        };
        return {
            range,
            color: colorPalette[index],
        };
    });
}
