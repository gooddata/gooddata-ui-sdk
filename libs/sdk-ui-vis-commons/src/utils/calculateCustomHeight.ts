// (C) 2021-2026 GoodData Corporation

//Obtained from subtracting the widget title and paddings/margins of visualization.
const MINIMUM_HEIGHT_FOR_PAGINATION = 160;

/**
 * @internal
 * If the headline is narrower than this, the compare section will be rendered
 * vertically to save horizontal space.
 */
export const SMALL_COMPARE_SECTION_THRESHOLD = 160;

enum HEIGHT {
    SMALLEST = 34,
    EXTRA_SMALL = 44,
    SMALL = 54,
    NORMAL = 64,
    MEDIUM = 94,
    LARGE = 114,
}

enum FONT_SIZE {
    SMALLEST = 30,
    SMALL = 36,
    MEDIUM = 46,
    LARGE = 50,
}

/**
 * @internal
 * Calculate widget height and font size for Kpi's and Headlines
 * when enableCompactSize is set to true.
 */
export function calculateHeadlineHeightFontSize(
    secondaryItem?: boolean,
    clientHeight?: number,
): { height: number | undefined; fontSize: number | undefined } {
    let height: number;
    let fontSize: number;

    if (!clientHeight) {
        return { height: undefined, fontSize: undefined };
    }

    if (secondaryItem) {
        if (clientHeight <= (HEIGHT.MEDIUM as number)) {
            height = HEIGHT.SMALLEST;
            fontSize = FONT_SIZE.SMALLEST;
        } else if (clientHeight <= (HEIGHT.LARGE as number)) {
            height = HEIGHT.SMALL;
            fontSize = FONT_SIZE.MEDIUM;
        } else {
            height = HEIGHT.NORMAL;
            fontSize = FONT_SIZE.LARGE;
        }
    } else {
        if (clientHeight <= (HEIGHT.SMALLEST as number)) {
            height = HEIGHT.SMALLEST;
            fontSize = FONT_SIZE.SMALLEST;
        } else if (clientHeight <= (HEIGHT.EXTRA_SMALL as number)) {
            height = HEIGHT.EXTRA_SMALL;
            fontSize = FONT_SIZE.SMALL;
        } else {
            height = HEIGHT.NORMAL;
            fontSize = FONT_SIZE.LARGE;
        }
    }

    return { height, fontSize };
}

/**
 * @internal
 * Check if Kpi's and Headlines should display pagination according to widget height.
 */
export const shouldRenderPagination = (
    enableCompactSize: boolean,
    width: number,
    height: number,
): boolean => {
    const isSmallHeight = height <= MINIMUM_HEIGHT_FOR_PAGINATION;
    const isSmallWidth = width < SMALL_COMPARE_SECTION_THRESHOLD;
    return enableCompactSize && isSmallWidth && isSmallHeight;
};
