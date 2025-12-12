// (C) 2021 GoodData Corporation
import { type IColorLegendSize } from "@gooddata/sdk-ui-vis-commons";

/**
 * Geo chart has special breakpoints related to responsive behavior
 */
const MIN_WIDTH_TO_RENDER_LEGEND_WITH_TITLES = 260;
const MIN_WIDTH_TO_RENDER_CIRCLE_SIZE_LEGEND = 330;
// We keep this as two separate constants because they handle different things
const MIN_WIDTH_TO_RENDER_MIDDLE_CIRCLE_IN_CIRCLE_SIZE_LEGEND = 410;
const MIN_WIDTH_TO_RENDER_LARGE_COLOR_LEGEND = 410;

function shouldRenderLegendTitles(width: number | undefined): boolean {
    return width ? width >= MIN_WIDTH_TO_RENDER_LEGEND_WITH_TITLES : true;
}

function shouldRenderWholeCircleLegend(width: number | undefined): boolean {
    return width ? width >= MIN_WIDTH_TO_RENDER_CIRCLE_SIZE_LEGEND : true;
}

function shouldRenderLargeColorLegend(width: number | undefined): boolean {
    return width ? width >= MIN_WIDTH_TO_RENDER_LARGE_COLOR_LEGEND : true;
}

export function getResponsiveInfo(
    responsive: boolean | "autoPositionWithPopup" | undefined,
): boolean | "autoPositionWithPopup" {
    if (isAutoPositionWithPopup(responsive)) {
        return responsive;
    }
    return Boolean(responsive);
}

export function isAutoPositionWithPopup(
    responsive: boolean | "autoPositionWithPopup" | undefined,
): responsive is "autoPositionWithPopup" {
    return responsive === "autoPositionWithPopup";
}

export function getPushpinColorLegendSize(
    width: number | undefined,
    isFluidLegend: boolean | undefined,
    responsive: boolean | "autoPositionWithPopup" | undefined,
): IColorLegendSize {
    const isAutoPosition = isAutoPositionWithPopup(responsive);
    const isSmall = isAutoPosition && !shouldRenderLargeColorLegend(width);
    let size: IColorLegendSize = "large";

    if (isSmall) {
        size = "small";
    }

    if (isFluidLegend) {
        size = "medium";
    }

    return size;
}

export function getPushpinColorLegendTitle(
    title: string | undefined,
    width: number | undefined,
    responsive: boolean | "autoPositionWithPopup" | undefined,
): string | undefined {
    const isAutoPosition = isAutoPositionWithPopup(responsive);
    return isAutoPosition && title && shouldRenderLegendTitles(width) ? title : undefined;
}

export function isSmallPushpinSizeLegend(
    width: number | undefined,
    ignoreSmallSize: boolean,
    responsive: boolean | "autoPositionWithPopup" | undefined,
): boolean {
    return !ignoreSmallSize && isAutoPositionWithPopup(responsive) && !shouldRenderWholeCircleLegend(width);
}

export function getPushpinSizeLegendTitle(
    title: string | undefined,
    width: number | undefined,
    ignoreMeasureName: boolean,
): string | undefined {
    return !ignoreMeasureName && shouldRenderLegendTitles(width) ? title : undefined;
}

export function shouldRenderCircleLegendInsidePopUp(
    width: number | undefined,
    renderPopUp: boolean | undefined,
): boolean {
    return !shouldRenderWholeCircleLegend(width) && Boolean(renderPopUp);
}

export function shouldRenderMiddleCircle(width: number | undefined, ignoreSmallSize: boolean): boolean {
    return (
        ignoreSmallSize ||
        (shouldRenderWholeCircleLegend(width) &&
            (width ? width >= MIN_WIDTH_TO_RENDER_MIDDLE_CIRCLE_IN_CIRCLE_SIZE_LEGEND : true))
    );
}
