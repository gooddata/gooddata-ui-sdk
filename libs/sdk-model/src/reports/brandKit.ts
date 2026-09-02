// (C) 2026 GoodData Corporation

import { type IRgbColorValue } from "../colors/index.js";

/**
 * Named brand image offered to report authors.
 *
 * @alpha
 */
export interface IReportsBrandKitImage {
    /**
     * Identifier the image is referenced by from report content, as the
     * `{{image_<id>}}` variable. Must match /^[a-zA-Z0-9_]+$/.
     */
    id: string;

    /**
     * Absolute URL of the externally hosted image. The organization CSP must allow the
     * host, and for exports the host must also serve CORS headers.
     */
    url: string;

    /**
     * Human readable description shown when the image is offered in the editor.
     */
    description?: string;
}

/**
 * Brand colors.
 *
 * @remarks
 * Every color but {@link IReportsBrandKitColors.chart} is written into CSS, so it may be stated in
 * any notation CSS reads. Chart colors become palette entries instead of declarations, so they are
 * held to {@link parseReportsBrandChartColor} and a value it cannot read is dropped.
 *
 * @alpha
 */
export interface IReportsBrandKitColors {
    /**
     * Primary brand color, offered to authors as a swatch.
     *
     * @remarks
     * Also seeds the derived chart palette when {@link IReportsBrandKitColors.chart} is not
     * provided — but only when stated in a notation {@link parseReportsBrandChartColor} reads,
     * since seeding means computing tints of it rather than declaring it. Stated in any other
     * notation it remains a swatch, and charts keep the workspace palette.
     */
    brand?: string;

    /**
     * Ordered chart series colors the visualization palette is derived from. Each must be a color
     * {@link parseReportsBrandChartColor} reads; the sanitizer drops the rest.
     */
    chart?: string[];

    /**
     * Ink of headings and titles.
     */
    ink?: string;

    /**
     * Ink of body and secondary text.
     */
    inkMuted?: string;

    /**
     * Default page background.
     */
    paper?: string;

    /**
     * Alternate background for covers and highlighted sections.
     */
    paperAlt?: string;
}

/**
 * One hosted font file, loaded as a font face for rendered reports.
 *
 * @alpha
 */
export interface IReportsBrandKitFontFace {
    /**
     * Font family name the face registers; reference it from
     * {@link IReportsBrandKitTypography.fontFamily}.
     */
    family: string;

    /**
     * Absolute URL of the externally hosted font file (TTF/OTF/WOFF/WOFF2). The organization
     * CSP must allow the host as a font source, and for exports the host must also serve
     * CORS headers.
     */
    url: string;

    /**
     * CSS font-weight the face carries (1-1000). Defaults to 400.
     */
    weight?: number;

    /**
     * Defaults to "normal".
     */
    style?: "normal" | "italic";
}

/**
 * Brand typography.
 *
 * @alpha
 */
export interface IReportsBrandKitTypography {
    /**
     * CSS font-family stack applied to rendered reports.
     */
    fontFamily?: string;

    /**
     * Hosted font files backing the families named in
     * {@link IReportsBrandKitTypography.fontFamily}.
     */
    fonts?: IReportsBrandKitFontFace[];
}

/**
 * Brand assets, all hosted outside the platform.
 *
 * @alpha
 */
export interface IReportsBrandKitAssets {
    /**
     * Primary logo URL; resolves the `{{logo}}` report variable, taking precedence over
     * the workspace white-labeling logo.
     */
    logo?: string;

    /**
     * Logo variant for dark backgrounds; resolves the `{{logoInverse}}` report variable.
     */
    logoInverse?: string;

    /**
     * Additional brand images, each resolving its `{{image_<id>}}` report variable.
     */
    images?: IReportsBrandKitImage[];
}

/**
 * Workspace brand kit: the customer's colors, assets, and typography reports are branded with.
 *
 * @remarks
 * Stored as the free-form content of the `reportsBrandKit` workspace setting. Everything is
 * optional; each part degrades independently to the product defaults. Assets resolve report
 * variables, chart colors derive the visualization palette, typography applies to rendered
 * reports.
 *
 * @alpha
 */
export interface IReportsBrandKit {
    /**
     * Content model version, for stored-content evolution.
     */
    version: "1";

    colors?: IReportsBrandKitColors;

    typography?: IReportsBrandKitTypography;

    assets?: IReportsBrandKitAssets;
}

/**
 * Prefix of the report variables brand kit images resolve; custom report variables must not
 * use it.
 *
 * @alpha
 */
export const ReportsBrandKitImageVariablePrefix = "image_";

/**
 * Name of the report variable resolving the brand kit image with the given id.
 *
 * @alpha
 */
export function reportsBrandKitImageVariable(imageId: string): string {
    return `${ReportsBrandKitImageVariablePrefix}${imageId}`;
}

const imageIdPattern = /^[a-zA-Z0-9_]+$/;

const HEX_COLOR = /^#(?<digits>[0-9a-f]{3,8})$/i;
// Either the comma form or the space form, not a mixture of the two, and an alpha that is an
// actual number: `rgb(1, 2 3)` and `rgba(1,2,3,.)` are no more colors than a word would be.
const RGB_NUMBER = String.raw`\d{1,3}`;
const RGB_ALPHA = String.raw`(?:\d+(?:\.\d+)?|\.\d+)%?`;
const RGB_COLOR = new RegExp(
    String.raw`^rgba?\(\s*(?:` +
        String.raw`(?<r>${RGB_NUMBER})\s*,\s*(?<g>${RGB_NUMBER})\s*,\s*(?<b>${RGB_NUMBER})(?:\s*,\s*${RGB_ALPHA})?` +
        String.raw`|` +
        String.raw`(?<rs>${RGB_NUMBER})\s+(?<gs>${RGB_NUMBER})\s+(?<bs>${RGB_NUMBER})(?:\s*/\s*${RGB_ALPHA})?` +
        String.raw`)\s*\)$`,
    "i",
);

// Alpha is dropped from a 4- or 8-digit hex and from rgba(): a palette fill is opaque rgb.
function fromHexDigits(digits: string): IRgbColorValue | undefined {
    const short = digits.length === 3 || digits.length === 4;
    if (!short && digits.length !== 6 && digits.length !== 8) {
        return undefined;
    }
    const width = short ? 1 : 2;
    const channel = (index: number): number => {
        const part = digits.slice(index * width, index * width + width);
        return Number.parseInt(short ? part + part : part, 16);
    };
    return { r: channel(0), g: channel(1), b: channel(2) };
}

/**
 * Reads one of {@link IReportsBrandKitColors.chart} as rgb channels, or undefined where the value is
 * not one of the notations those colors are stated in.
 *
 * @remarks
 * Chart colors become palette entries rather than CSS declarations, so unlike the rest of the kit
 * they are held to what this reads: hex (3, 4, 6 or 8 digits) and `rgb()`/`rgba()`. The sanitizer
 * drops what this cannot read, so a stored kit never carries a chart color the palette would
 * silently ignore.
 *
 * @alpha
 */
export function parseReportsBrandChartColor(color: string): IRgbColorValue | undefined {
    const trimmed = color.trim();

    const hex = HEX_COLOR.exec(trimmed);
    if (hex?.groups) {
        return fromHexDigits(hex.groups["digits"]!);
    }

    const rgb = RGB_COLOR.exec(trimmed);
    if (rgb?.groups) {
        // One of the two forms matched, so each channel sits in exactly one of the two group sets.
        const channels = [
            ["r", "rs"],
            ["g", "gs"],
            ["b", "bs"],
        ].map(([comma, space]) => Number(rgb.groups![comma!] ?? rgb.groups![space!]));
        return channels.every((value) => value <= 255)
            ? { r: channels[0]!, g: channels[1]!, b: channels[2]! }
            : undefined;
    }

    return undefined;
}

// Brand assets are fetched over the network and drawn into reports; a url of any other scheme
// (javascript:, data:, a relative path) does not describe an externally hosted asset and is dropped
// rather than reaching an element's src or a @font-face rule.
function sanitizedAssetUrl(value: unknown): string | undefined {
    const url = sanitizedString(value);
    if (url === undefined) {
        return undefined;
    }
    try {
        const { protocol } = new URL(url);
        return protocol === "https:" || protocol === "http:" ? url : undefined;
    } catch {
        return undefined;
    }
}

function sanitizedString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function withDefined<T extends object>(parts: T): T | undefined {
    const defined = Object.fromEntries(Object.entries(parts).filter(([, value]) => value !== undefined));
    return Object.keys(defined).length > 0 ? (defined as T) : undefined;
}

function sanitizedColors(value: unknown): IReportsBrandKitColors | undefined {
    if (typeof value !== "object" || value === null) {
        return undefined;
    }
    const colors = value as IReportsBrandKitColors;
    const chart = Array.isArray(colors.chart)
        ? colors.chart
              .map(sanitizedString)
              .filter(
                  (color): color is string =>
                      color !== undefined && parseReportsBrandChartColor(color) !== undefined,
              )
        : undefined;
    return withDefined({
        brand: sanitizedString(colors.brand),
        chart: chart !== undefined && chart.length > 0 ? chart : undefined,
        ink: sanitizedString(colors.ink),
        inkMuted: sanitizedString(colors.inkMuted),
        paper: sanitizedString(colors.paper),
        paperAlt: sanitizedString(colors.paperAlt),
    });
}

function sanitizedFontFace(value: unknown): IReportsBrandKitFontFace | undefined {
    if (typeof value !== "object" || value === null) {
        return undefined;
    }
    const { family, url, weight, style } = value as IReportsBrandKitFontFace;
    const sanitizedFamily = sanitizedString(family);
    const sanitizedUrl = sanitizedAssetUrl(url);
    if (sanitizedFamily === undefined || sanitizedUrl === undefined) {
        return undefined;
    }
    return withDefined({
        family: sanitizedFamily,
        url: sanitizedUrl,
        weight: typeof weight === "number" && weight >= 1 && weight <= 1000 ? weight : undefined,
        style: style === "normal" || style === "italic" ? style : undefined,
    });
}

function sanitizedFonts(value: unknown): IReportsBrandKitFontFace[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }
    const fonts = value
        .map(sanitizedFontFace)
        .filter((font): font is IReportsBrandKitFontFace => font !== undefined);
    return fonts.length > 0 ? fonts : undefined;
}

function sanitizedTypography(value: unknown): IReportsBrandKitTypography | undefined {
    if (typeof value !== "object" || value === null) {
        return undefined;
    }
    const typography = value as IReportsBrandKitTypography;
    return withDefined({
        fontFamily: sanitizedString(typography.fontFamily),
        fonts: sanitizedFonts(typography.fonts),
    });
}

function sanitizedImages(value: unknown): IReportsBrandKitImage[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }
    const seen = new Set<string>();
    const images: IReportsBrandKitImage[] = [];
    for (const entry of value) {
        if (typeof entry !== "object" || entry === null) {
            continue;
        }
        const { id, url, description } = entry as IReportsBrandKitImage;
        if (typeof id !== "string" || !imageIdPattern.test(id) || seen.has(id)) {
            continue;
        }
        const sanitizedUrl = sanitizedAssetUrl(url);
        if (sanitizedUrl === undefined) {
            continue;
        }
        seen.add(id);
        images.push(withDefined({ id, url: sanitizedUrl, description: sanitizedString(description) })!);
    }
    return images.length > 0 ? images : undefined;
}

function sanitizedAssets(value: unknown): IReportsBrandKitAssets | undefined {
    if (typeof value !== "object" || value === null) {
        return undefined;
    }
    const assets = value as IReportsBrandKitAssets;
    return withDefined({
        logo: sanitizedAssetUrl(assets.logo),
        logoInverse: sanitizedAssetUrl(assets.logoInverse),
        images: sanitizedImages(assets.images),
    });
}

/**
 * Reads a stored brand kit from free-form JSON, keeping the parts that are valid and dropping
 * everything else.
 *
 * @remarks
 * The setting content is not schema-validated by the backend, so every consumer must go
 * through this. Returns undefined only when the value is not a version "1" brand kit at all;
 * a kit whose sections are absent or entirely invalid comes back empty, which the type permits
 * and a workspace that has not filled its kit in yet carries.
 *
 * @alpha
 */
export function sanitizeReportsBrandKit(value: unknown): IReportsBrandKit | undefined {
    if (typeof value !== "object" || (value as IReportsBrandKit)?.version !== "1") {
        return undefined;
    }
    const kit = value as IReportsBrandKit;
    const parts = withDefined({
        colors: sanitizedColors(kit.colors),
        typography: sanitizedTypography(kit.typography),
        assets: sanitizedAssets(kit.assets),
    });
    return { version: "1", ...parts };
}
