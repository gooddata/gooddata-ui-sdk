// (C) 2026 GoodData Corporation

export const DASHBOARD_TITLE_MAX_LENGTH = 255;

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * Keeps the title within `maxLength` UTF-16 code units, the same count a native `maxlength` input uses,
 * without splitting a character such as an emoji. Whitespace left at the end by the cut is removed.
 */
export function truncateDashboardTitle(title: string, maxLength = DASHBOARD_TITLE_MAX_LENGTH): string {
    const limit = Math.max(maxLength, 0);
    if (title.length <= limit) {
        return title;
    }

    let end = 0;
    for (const { segment } of graphemeSegmenter.segment(title)) {
        if (end + segment.length > limit) {
            break;
        }
        end += segment.length;
    }

    return title.slice(0, end).trimEnd();
}
