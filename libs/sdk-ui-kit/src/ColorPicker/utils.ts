// (C) 2007-2021 GoodData Corporation
import tinycolor, { ColorFormats } from "tinycolor2";

export const SATURATION_ARRAY = [0.1, 0.3, 0.4, 0.5, 0.65, 0.8, 0.9, 1];

const HEX_LENGTH_WITH_HASH = 7;
const HEX_LENGTH_WITHOUT_HASH = 6;

export function getHexFromHslColor(hsl: ColorFormats.HSL): string {
    const color = tinycolor(`hsl(${hsl.h}, ${hsl.s * 100}%, ${hsl.l * 100}% )`);

    return color.toHexString();
}

export function getRgbFromHslColor(hsl: ColorFormats.HSL): ColorFormats.RGB {
    const color = tinycolor(`hsl(${hsl.h}, ${hsl.s * 100}%, ${hsl.l * 100}% )`);
    const { r, g, b } = color.toRgb();
    return { r, g, b };
}

export function getHslFromRgbColor(rgb: ColorFormats.RGB): ColorFormats.HSL {
    const color = tinycolor(`rgb ${rgb.r} ${rgb.g} ${rgb.b}`);
    const { h, s, l } = color.toHsl();
    return { h, s, l };
}

export function getHslFromHexColor(hex: string): ColorFormats.HSL {
    const color = tinycolor(hex);
    const { h, s, l } = color.toHsl();
    return { h, s, l };
}

function getHslColorString(hue: number, saturation: number, lightness: number): string {
    return `hsl(${hue}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
}

export function getColorStyle(hslColor: ColorFormats.HSL): React.CSSProperties {
    return {
        backgroundColor: getHslColorString(hslColor.h, hslColor.s, hslColor.l),
        borderColor: hslColor.l > 0.95 ? "#ccc" : null,
    };
}

function hasHexStringValidLength(hexColorString: string): boolean {
    return (
        (hexColorString.startsWith("#") && hexColorString.length === HEX_LENGTH_WITH_HASH) ||
        hexColorString.length === HEX_LENGTH_WITHOUT_HASH
    );
}

export function isHexColorValid(hexColorString: string): boolean {
    return hasHexStringValidLength(hexColorString) && tinycolor(hexColorString).isValid();
}

export function isHslColorBlackOrWhite(hslColor: ColorFormats.HSL): boolean {
    return hslColor.l === 1 || hslColor.l === 0;
}

function getX(e: TouchEvent | MouseEvent) {
    return (e as TouchEvent)?.touches?.[0]?.pageX
        ? (e as TouchEvent).touches[0].pageX
        : (e as MouseEvent).pageX;
}

export function calculateHueChange(
    e: TouchEvent | MouseEvent,
    hue: number,
    container: HTMLDivElement,
): ColorFormats.HSL {
    e.preventDefault();
    const containerWidth = container.clientWidth;

    const x = getX(e);
    const left = x - (container.getBoundingClientRect().left + window.pageXOffset);

    let h;
    if (left < 0) {
        h = 0;
    } else if (left > containerWidth) {
        h = 359;
    } else {
        const percent = (left * 100) / containerWidth;
        h = (360 * percent) / 100;
    }

    if (hue !== h) {
        return {
            h,
            s: 0.5,
            l: 0.5,
        };
    }

    return null;
}
