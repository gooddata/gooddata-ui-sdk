// (C) 2026 GoodData Corporation

/**
 * Page shape a page layout is designed for.
 *
 * @remarks
 * A layout's geometry only reads correctly at the proportions it was authored for: a row of three
 * visualizations that works on a widescreen page is unusably narrow on an upright page. The format
 * is therefore a property of the page, not a choice made when rendering it.
 *
 * @alpha
 */
export type PublisherPageFormatV1 = "widescreen" | "a4Portrait" | "letterPortrait";

/**
 * Format assumed by a page that declares none, which keeps pages authored before formats existed
 * on the shape they were designed for.
 *
 * @alpha
 */
export const DefaultPublisherPageFormatV1: PublisherPageFormatV1 = "widescreen";

/**
 * List of built-in page format names.
 *
 * @alpha
 */
export const PublisherPageFormatsV1: PublisherPageFormatV1[] = ["widescreen", "a4Portrait", "letterPortrait"];

/**
 * Width divided by height for each page format: 16:9 for a widescreen page, ISO A4 (210 x 297 mm) and
 * US Letter (8.5 x 11 in) upright.
 *
 * @alpha
 */
export const PublisherPageFormatAspectRatiosV1: Record<PublisherPageFormatV1, number> = {
    widescreen: 16 / 9,
    a4Portrait: 210 / 297,
    letterPortrait: 8.5 / 11,
};

/**
 * Type-guard testing whether the provided value is a {@link PublisherPageFormatV1}.
 *
 * @alpha
 */
export function isPublisherPageFormatV1(value: unknown): value is PublisherPageFormatV1 {
    return typeof value === "string" && PublisherPageFormatsV1.includes(value as PublisherPageFormatV1);
}
