// (C) 2026 GoodData Corporation

/**
 * Page shape a report page layout is designed for.
 *
 * @remarks
 * A layout's geometry only reads correctly at the proportions it was authored for: a row of three
 * visualizations that works on a widescreen slide is unusably narrow on an upright page. The format
 * is therefore a property of the page, not a choice made when rendering it.
 *
 * @alpha
 */
export type ReportPageFormat = "widescreen" | "a4Portrait" | "letterPortrait";

/**
 * Format assumed by a page that declares none, which keeps pages authored before formats existed
 * on the shape they were designed for.
 *
 * @alpha
 */
export const DefaultReportPageFormat: ReportPageFormat = "widescreen";

/**
 * List of built-in report page format names.
 *
 * @alpha
 */
export const ReportPageFormats: ReportPageFormat[] = ["widescreen", "a4Portrait", "letterPortrait"];

/**
 * Width divided by height for each page format: 16:9 for a slide, ISO A4 (210 x 297 mm) and
 * US Letter (8.5 x 11 in) upright.
 *
 * @alpha
 */
export const ReportPageFormatAspectRatios: Record<ReportPageFormat, number> = {
    widescreen: 16 / 9,
    a4Portrait: 210 / 297,
    letterPortrait: 8.5 / 11,
};

/**
 * Type-guard testing whether the provided value is a {@link ReportPageFormat}.
 *
 * @alpha
 */
export function isReportPageFormat(value: unknown): value is ReportPageFormat {
    return typeof value === "string" && ReportPageFormats.includes(value as ReportPageFormat);
}
