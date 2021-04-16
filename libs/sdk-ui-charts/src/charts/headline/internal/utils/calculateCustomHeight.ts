// (C) 2021 GoodData Corporation
import { IHeadlineDataItem } from "../../Headlines";

// Obtained from substrabting the widget title and paddings/margins of visualization.
export const MINIMUM_HEIGHT_FOR_PAGINATION = 174;

export enum HEIGHT {
    SMALLEST = 34,
    EXTRA_SMALL = 44,
    SMALL = 54,
    NORMAL = 64,
    MEDIUM = 84,
    LARGE = 104,
}

export enum FONT_SIZE {
    SMALLEST = 30,
    SMALL = 36,
    MEDIUM = 46,
    LARGE = 50,
}

export function calculateHeadlineHeightFontSize(
    secondaryItem: IHeadlineDataItem,
    clientHeight?: number,
): { height: number; fontSize: number } {
    let height: number;
    let fontSize: number;

    if (!clientHeight) {
        return { height: undefined, fontSize: undefined };
    }

    if (!secondaryItem) {
        if (clientHeight <= HEIGHT.SMALLEST) {
            height = HEIGHT.SMALLEST;
            fontSize = FONT_SIZE.SMALLEST;
        } else if (clientHeight <= HEIGHT.EXTRA_SMALL) {
            height = HEIGHT.EXTRA_SMALL;
            fontSize = FONT_SIZE.SMALL;
        } else {
            height = HEIGHT.NORMAL;
            fontSize = FONT_SIZE.LARGE;
        }
    } else {
        if (clientHeight <= HEIGHT.MEDIUM) {
            height = HEIGHT.SMALLEST;
            fontSize = FONT_SIZE.SMALLEST;
        } else if (clientHeight <= HEIGHT.LARGE) {
            height = HEIGHT.SMALL;
            fontSize = FONT_SIZE.MEDIUM;
        } else {
            height = HEIGHT.NORMAL;
            fontSize = FONT_SIZE.LARGE;
        }
    }

    return { height, fontSize };
}
