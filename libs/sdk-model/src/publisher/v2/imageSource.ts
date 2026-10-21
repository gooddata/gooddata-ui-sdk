// (C) 2026 GoodData Corporation

import { getPublisherThemeReferencePathV2 } from "./themeReference.js";
import {
    type PublisherTextVariableV2,
    PublisherTextVariablesV2,
    resolvePublisherTextPlaceholdersV2,
} from "./variables.js";

/**
 * A theme image that an image source names in place of a url.
 *
 * @remarks
 * `{theme.logo}` is the logo asset with the id `logo`, else the first logo asset, then the theme's
 * `images.logo`, then the organization's white-labeling logo. `{theme.coverImage}` is the theme's
 * `images.coverImage`. `{theme.assets.logos.<id>}` and `{theme.assets.images.<id>}` are the asset with
 * that id in that list.
 *
 * @alpha
 */
export type PublisherThemeImageReferenceV2 =
    | { type: "logo" }
    | { type: "coverImage" }
    | { type: "asset"; list: "logos" | "images"; id: string };

/**
 * The theme image an image source references, such as `{theme.assets.logos.main}`; undefined when the
 * source is not a theme image reference.
 *
 * @remarks
 * Image references resolve only as an image source or a background image, never in text.
 *
 * @alpha
 */
export function getPublisherThemeImageReferenceV2(
    source: unknown,
): PublisherThemeImageReferenceV2 | undefined {
    const [first, list, id, ...rest] = getPublisherThemeReferencePathV2(source) ?? [];
    if (list === undefined) {
        return first === "logo" || first === "coverImage" ? { type: first } : undefined;
    }
    if (
        first === "assets" &&
        (list === "logos" || list === "images") &&
        id !== undefined &&
        rest.length === 0
    ) {
        return { type: "asset", list, id };
    }
    return undefined;
}

const HTTPS_URL = /^https:\/\/\S+$/;

/**
 * An https image url with its text variables replaced, each value percent-encoded so that it stays one
 * part of the url. A marker without a value stays as typed. Undefined when the result is not an https url.
 *
 * @alpha
 */
export function resolvePublisherImageUrlV2(
    url: string,
    values: Partial<Record<PublisherTextVariableV2, string>>,
): string | undefined {
    const encoded: Partial<Record<PublisherTextVariableV2, string>> = {};
    for (const name of PublisherTextVariablesV2) {
        const value = values[name];
        if (value !== undefined) {
            encoded[name] = encodeURIComponent(value);
        }
    }
    const resolved = resolvePublisherTextPlaceholdersV2(url, encoded);
    return HTTPS_URL.test(resolved) ? resolved : undefined;
}
