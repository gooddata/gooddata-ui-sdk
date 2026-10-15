// (C) 2026 GoodData Corporation

// Segments follow the validator's theme names, so a color id or a shadow name may hold dashes.
const themeReferenceRegex = /^\{theme((?:\.[A-Za-z0-9_-]+)+)\}$/;

/**
 * The path of a theme reference such as `{theme.colors.texts.muted}`, as
 * `["colors", "texts", "muted"]`; undefined when the value is not one.
 *
 * @remarks
 * A theme reference is always the whole value, never part of a longer string.
 *
 * @alpha
 */
export function getPublisherThemeReferencePathV2(value: unknown): string[] | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    const match = themeReferenceRegex.exec(value);
    return match === null ? undefined : match[1]!.slice(1).split(".");
}

/**
 * The theme reference to the path, such as `{theme.assets.images.cover}`.
 *
 * @alpha
 */
export function publisherThemeReferenceV2(path: readonly string[]): string {
    return `{theme.${path.join(".")}}`;
}
