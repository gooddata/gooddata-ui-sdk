// (C) 2007-2025 GoodData Corporation
import { ContentRect } from "react-measure";
import { PositionType } from "../types.js";
import { TOP, RIGHT, BOTTOM } from "../PositionTypes.js";

const LEGEND_WIDTH_BREAKPOINT = 610;
const LEGEND_HEIGHT_BREAKPOINT_SM = 194;
const LEGEND_HEIGHT_BREAKPOINT_ML = 274;

function getLegendDetailsForAutoResponsive(
    legendPosition: PositionType,
    contentRect?: ContentRect,
    legendLabel?: string,
    respectLegendPosition?: boolean,
): ILegendDetails | null {
    const width = contentRect?.client?.width;
    const height = contentRect?.client?.height;

    if (!width || !height) {
        return null;
    }

    const name = legendLabel ? { name: legendLabel } : {};

    const isLegendTopBottom = legendPosition === "top" || legendPosition === "bottom";
    const maxRowsForTopBottom = height < LEGEND_HEIGHT_BREAKPOINT_ML ? 1 : 2;
    const legendDetailsWithoutSizePositionChanges = {
        ...name,
        position: legendPosition,
        renderPopUp: isLegendTopBottom,
        maxRows: isLegendTopBottom ? maxRowsForTopBottom : undefined,
    };

    // In case when position is different than auto and respectLegendPosition flag is true,
    // we use legend details without position changes based on sizing.
    const shouldRespectLegendPosition = respectLegendPosition && legendPosition !== "auto";
    if (shouldRespectLegendPosition) {
        return legendDetailsWithoutSizePositionChanges;
    }

    // Decision logic: https://gooddata.invisionapp.com/console/share/KJ2A59MOAQ/548340571
    if (width < LEGEND_WIDTH_BREAKPOINT) {
        const maxRowsForTop = height < LEGEND_HEIGHT_BREAKPOINT_ML ? 1 : 2;
        return { ...name, position: TOP, renderPopUp: true, maxRows: maxRowsForTop };
    } else {
        if (height < LEGEND_HEIGHT_BREAKPOINT_SM) {
            return { ...name, position: RIGHT, renderPopUp: false };
        } else {
            return legendDetailsWithoutSizePositionChanges;
        }
    }
}

function getLegendDetailsForStandard(
    legendPosition: PositionType,
    responsive: boolean,
    showFluidLegend?: boolean,
    isHeatmap?: boolean,
): ILegendDetails {
    let pos = legendPosition;
    if (isHeatmap) {
        const isSmall = Boolean(responsive && showFluidLegend);
        if (isSmall) {
            pos = legendPosition === TOP ? TOP : BOTTOM;
        } else {
            pos = legendPosition || RIGHT;
        }
    }

    return {
        position: pos,
        renderPopUp: false,
    };
}

/**
 * @internal
 */
export interface ILegendDetails {
    name?: string;
    position: PositionType;
    maxRows?: number;
    renderPopUp?: boolean;
}

/**
 * @internal
 */
export interface ILegendDetailOptions {
    contentRect?: ContentRect;
    showFluidLegend?: boolean;
    isHeatmap?: boolean;
    legendLabel?: string;
}

/**
 * @internal
 */
export function getLegendDetails(
    legendPosition: PositionType,
    responsive: boolean | "autoPositionWithPopup",
    options: ILegendDetailOptions,
    respectLegendPosition?: boolean,
): ILegendDetails | null {
    if (responsive !== "autoPositionWithPopup") {
        return getLegendDetailsForStandard(
            legendPosition,
            responsive,
            options.showFluidLegend,
            options.isHeatmap,
        );
    }
    return getLegendDetailsForAutoResponsive(
        legendPosition,
        options.contentRect,
        options.legendLabel,
        respectLegendPosition,
    );
}
