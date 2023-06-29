// (C) 2007-2022 GoodData Corporation
import { VisType } from "@gooddata/sdk-ui";
import { DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT_PX } from "@gooddata/sdk-ui-ext";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../../_staging/dashboard/fluidLayout/index.js";

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
    const defaultVisualizationHeight = DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT_PX - HEADLINE_OUTER_HEIGHT;
    const maxHeight =
        widgetMaxHeight > defaultVisualizationHeight ? widgetMaxHeight : defaultVisualizationHeight;
    return {
        height: widgetHeight,
        maxHeight,
    };
}

export function isGeoPushpin(visType: VisType): boolean {
    return visType === "pushpin";
}

export function isFullWidthGeoPushpin(currentColumnWidth: number, visType: VisType): boolean {
    return isGeoPushpin(visType) && currentColumnWidth === DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
}

export function getGeoPushpinWidgetStyle(
    visType: VisType,
    visualizationItemWidth: number,
    currentColumnWidth: number,
    windowHeight: number,
    enableCustomHeight: boolean,
): React.CSSProperties | null {
    if (isFullWidthGeoPushpin(currentColumnWidth, visType) && !enableCustomHeight) {
        const { height, maxHeight } = calculateGeoPushpinWidgetHeight(windowHeight, visualizationItemWidth);
        return {
            height,
            maxHeight,
        };
    }

    return null;
}
