// (C) 2021 GoodData Corporation
import { SMALL_COMPARE_SECTION_THRESHOLD } from "./calculateCustomHeight";
const RESPONSIVE_SMALL = "gd-small";
const RESPONSIVE_MEDIUM = "gd-medium";
const RESPONSIVE_LARGE = "gd-large";
const RESPONSIVE_SHORTENED_LABEL = "gd-shortened-label";

/**
 * @internal
 * Provides responsive class for headline/kpi component based on its width and state of secondary item
 */
export const getHeadlineResponsiveClassName = (width: number, isShorttened?: boolean): string => {
    if (!width) {
        return "";
    }
    if (width < SMALL_COMPARE_SECTION_THRESHOLD) {
        return isShorttened ? RESPONSIVE_SHORTENED_LABEL : RESPONSIVE_SMALL;
    }

    return isShorttened ? RESPONSIVE_MEDIUM : RESPONSIVE_LARGE;
};
