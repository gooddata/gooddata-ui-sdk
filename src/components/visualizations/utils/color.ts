// (C) 2007-2018 GoodData Corporation
import isEmpty = require('lodash/isEmpty');
import isEqual = require('lodash/isEqual');
import {
    IColorPalette,
    IColorPaletteItem,
    IChartConfig,
    IRGBColor,
    IColorItem,
    IGuidColorItem,
    IMappingHeader,
    IColorMapping
} from '../../../interfaces/Config';

export const WHITE = 'rgb(255, 255, 255)';
export const BLACK = 'rgb(0, 0, 0)';
export const GRAY = 'rgb(201, 213, 223)';
export const AXIS_LINE_COLOR = '#d5d5d5';

export const DEFAULT_COLORS = [
    'rgb(20,178,226)',
    'rgb(0,193,141)',
    'rgb(229,77,66)',
    'rgb(241,134,0)',
    'rgb(171,85,163)',

    'rgb(244,213,33)',
    'rgb(148,161,174)',
    'rgb(107,191,216)',
    'rgb(181,136,177)',
    'rgb(238,135,128)',

    'rgb(241,171,84)',
    'rgb(133,209,188)',
    'rgb(41,117,170)',
    'rgb(4,140,103)',
    'rgb(181,60,51)',

    'rgb(163,101,46)',
    'rgb(140,57,132)',
    'rgb(136,219,244)',
    'rgb(189,234,222)',
    'rgb(239,197,194)'
];

export const DEFAULT_COLOR_PALETTE = [
    {
        guid: '1',
        fill: { r: 20, g: 178, b: 226 }
    },
    {
        guid: '2',
        fill: { r: 0, g: 193, b: 141 }
    },
    {
        guid: '3',
        fill: { r: 229, g: 77, b: 66 }
    },
    {
        guid: '4',
        fill: { r: 241, g: 134, b: 0 }
    },
    {
        guid: '5',
        fill: { r: 171, g: 85, b: 163 }
    },
    {
        guid: '6',
        fill: { r: 244, g: 213, b: 33 }
    },
    {
        guid: '7',
        fill: { r: 148, g: 161, b: 174 }
    },
    {
        guid: '8',
        fill: { r: 107, g: 191, b: 216 }
    },
    {
        guid: '9',
        fill: { r: 181, g: 136, b: 177 }
    },
    {
        guid: '10',
        fill: { r: 238, g: 135, b: 128 }
    },
    {
        guid: '11',
        fill: { r: 241, g: 171, b: 84 }
    },
    {
        guid: '12',
        fill: { r: 133, g: 209, b: 188 }
    },
    {
        guid: '13',
        fill: { r: 41, g: 117, b: 170 }
    },
    {
        guid: '14',
        fill: { r: 4, g: 140, b: 103 }
    },
    {
        guid: '15',
        fill: { r: 181, g: 60, b: 51 }
    },
    {
        guid: '16',
        fill: { r: 163, g: 101, b: 46 }
    },
    {
        guid: '17',
        fill: { r: 140, g: 57, b: 132 }
    },
    {
        guid: '18',
        fill: { r: 136, g: 219, b: 244 }
    },
    {
        guid: '19',
        fill: { r: 189, g: 234, b: 222 }
    },
    {
        guid: '20',
        fill: { r: 239, g: 197, b: 194 }
    }
];

export const HEATMAP_BLUE_COLOR_PALETTE = [
    'rgb(255,255,255)',
    'rgb(197,236,248)',
    'rgb(138,217,241)',
    'rgb(79,198,234)',
    'rgb(20,178,226)',
    'rgb(22,151,192)',
    'rgb(0,110,145)'
];

function lighter(color: number, percent: number) {
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent);

    return Math.round((t - color) * p) + color;
}

function formatColor(red: number, green: number, blue: number) {
    return `rgb(${red},${green},${blue})`;
}

export function parseRGBColorCode(color: string) {
    const f = color.split(',');
    const R = parseInt(f[0].slice(4), 10);
    const G = parseInt(f[1], 10);
    const B = parseInt(f[2], 10);
    return { R, G, B };
}

/**
 * Source:
 *     http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 */
export function getLighterColor(color: string, percent: number) {
    const { R, G, B } = parseRGBColorCode(color);

    return formatColor(
        lighter(R, percent),
        lighter(G, percent),
        lighter(B, percent)
    );
}

export function getLighterColorFromRGB(color: IRGBColor, percent: number) {
    const { r, g, b } = color;

    return {
        r: lighter(r, percent),
        g: lighter(g, percent),
        b: lighter(b, percent)
    };
}

export function normalizeColorToRGB(color: string) {
    const hexPattern = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i;
    return color.replace(hexPattern, (_prefix: string, r: string, g: string, b: string) => {
        return `rgb(${[r, g, b].map(value => (parseInt(value, 16).toString(10))).join(', ')})`;
    });
}

export function getColorPaletteFromColors(colors: string[]): IColorPalette {
    try {
        return colors.map((color: string, index: number) => {
            const { R, G, B } = parseRGBColorCode(normalizeColorToRGB(color));
            if (isNaN(R) || isNaN(G) || isNaN(B)) {
                throw Error;
            }
            return {
                guid: String(index),
                fill: {
                    r: R,
                    g: G,
                    b: B
                }
            };
        });
    } catch (_ignored) {
        return DEFAULT_COLOR_PALETTE;
    }
}

export function getRgbString(color: IColorPaletteItem): string {
    return `rgb(${color.fill.r},${color.fill.g},${color.fill.b})`;
}

export function getValidColorPalette(config: IChartConfig) {
    return isEmpty(config.colorPalette) ?
            (isEmpty(config.colors) ? DEFAULT_COLOR_PALETTE : getColorPaletteFromColors(config.colors))
            : config.colorPalette;
}

export function isCustomPalette(palette: IColorPalette) {
    return !isEqual(palette, DEFAULT_COLOR_PALETTE);
}

export function isGuidColorItem(color: IColorItem): color is IGuidColorItem {
    return (color as IGuidColorItem).type === 'guid';
}

export function getColorFromMapping(mappingHeader: IMappingHeader, colorMapping: IColorMapping[]
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

export function getRgbStringFromRGB(color: IRGBColor) {
    return `rgb(${color.r},${color.g},${color.b})`;
}
