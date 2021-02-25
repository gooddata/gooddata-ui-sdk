// (C) 2007-2021 GoodData Corporation
import { VisType } from "@gooddata/sdk-ui";
import {
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
    DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH,
    DASHBOARD_LAYOUT_VIS_TYPE,
} from "../../DashboardLayout/constants";

const RATIO_16_9 = 9 / 16;
const HEADER_HEIGHT = 330;
const PADDING_BOTTOM = 55;
const HEADLINE_OUTER_HEIGHT = 48 + 20; // item-headline-outer + padding-top/bottom

export function calculateGeoPushpinWidgetHeight(
    windowHeight: number,
    visualizationItemWidth: number,
): React.CSSProperties {
    const widgetHeight = Math.round(visualizationItemWidth * RATIO_16_9);
    const widgetMaxHeight = windowHeight - HEADER_HEIGHT - PADDING_BOTTOM;
    const defaultVisualizationHeight = DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT - HEADLINE_OUTER_HEIGHT;
    const maxHeight =
        widgetMaxHeight > defaultVisualizationHeight ? widgetMaxHeight : defaultVisualizationHeight;
    return {
        height: widgetHeight,
        maxHeight,
    };
}

export function isGeoPushpin(visType: VisType): boolean {
    return visType === DASHBOARD_LAYOUT_VIS_TYPE.pushpin;
}

export function isFullWidthGeoPushpin(currentColumnWidth: number, visType: VisType): boolean {
    return isGeoPushpin(visType) && currentColumnWidth === DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
}

export function getGeoPushpinWidgetStyle(
    visType: VisType,
    visualizationItemWidth: number,
    currentColumnWidth: number,
    windowHeight: number,
): React.CSSProperties {
    if (isFullWidthGeoPushpin(currentColumnWidth, visType)) {
        const { height, maxHeight } = calculateGeoPushpinWidgetHeight(windowHeight, visualizationItemWidth);
        return {
            height,
            maxHeight,
        };
    }

    return null;
}

const RESPONSIVE_SMALL = "small";
const RESPONSIVE_MEDIUM = "medium";
const RESPONSIVE_LARGE = "large";
const RESPONSIVE_SHORTENED_LABEL = "shortened-label";

export const getResponsiveClassName = (sectionDOMWidth: number, isShorttened?: boolean): string => {
    if (sectionDOMWidth < DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH) {
        return isShorttened ? RESPONSIVE_SHORTENED_LABEL : RESPONSIVE_SMALL;
    }

    return isShorttened ? RESPONSIVE_MEDIUM : RESPONSIVE_LARGE;
};
