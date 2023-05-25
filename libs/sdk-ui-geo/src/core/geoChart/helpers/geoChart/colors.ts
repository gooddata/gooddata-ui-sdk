// (C) 2019-2020 GoodData Corporation
import { IRgbColorValue } from "@gooddata/sdk-model";
import isString from "lodash/isString.js";
import range from "lodash/range.js";

function formatColor(red: number, green: number, blue: number, opacity: number = 1): string {
    if (opacity === 1) {
        return `rgb(${red},${green},${blue})`;
    }
    return `rgba(${red},${green},${blue},${opacity})`;
}

function parseRGBColorCode(color: string) {
    const f = color.split(",");
    const R = parseInt(f[0].slice(4), 10);
    const G = parseInt(f[1], 10);
    const B = parseInt(f[2], 10);
    return { R, G, B };
}

function getCalculatedChannel(channel: number, index: number, step: number): number {
    return Math.trunc(channel + index * step);
}

function getCalculatedColors(
    count: number,
    channels: number[],
    steps: number[],
    opacity: number = 1,
): string[] {
    return range(1, count).map((index: number): string =>
        formatColor(
            getCalculatedChannel(channels[0], index, steps[0]),
            getCalculatedChannel(channels[1], index, steps[1]),
            getCalculatedChannel(channels[2], index, steps[2]),
            opacity,
        ),
    );
}

function getRGBColorCode(color: string | IRgbColorValue): IRgbColorValue {
    if (isString(color)) {
        const { R: r, G: g, B: b } = parseRGBColorCode(color);
        return {
            r,
            g,
            b,
        };
    }
    return color;
}

export function getColorPalette(baseColor: string | IRgbColorValue, opacity: number = 1): string[] {
    const colorItemsCount = 6;
    const { r, g, b } = getRGBColorCode(baseColor);
    const channels = [r, g, b];
    const steps = channels.map((channel) => (255 - channel) / colorItemsCount);
    const generatedColors = getCalculatedColors(colorItemsCount, channels, steps, opacity);
    return [...generatedColors.reverse(), formatColor(r, g, b, opacity)];
}

export function rgbToRgba(color: string, opacity: number = 1): string {
    const { R, G, B } = parseRGBColorCode(color);
    return formatColor(R, G, B, opacity);
}
