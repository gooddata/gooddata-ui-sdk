// (C) 2007-2018 GoodData Corporation
export const WHITE = 'rgb(255, 255, 255)';
export const BLACK = 'rgb(0, 0, 0)';
export const GRAY = 'rgb(201, 213, 223)';

export const DEFAULT_COLOR_PALETTE = [
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

export function normalizeColorToRGB(color: string) {
    const hexPattern = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i;
    return color.replace(hexPattern, (_prefix: string, r: string, g: string, b: string) => {
        return `rgb(${[r, g, b].map(value => (parseInt(value, 16).toString(10))).join(', ')})`;
    });
}
