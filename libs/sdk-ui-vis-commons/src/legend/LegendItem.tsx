// (C) 2007-2025 GoodData Corporation

import { CSSProperties, useCallback } from "react";

import cx from "classnames";
import { unescape } from "lodash-es";

import { ITheme } from "@gooddata/sdk-model";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { LegendSeriesContextStore, useItemVisibility } from "./context.js";
import { ISeriesItemMetric } from "./types.js";
import { getDarkerColor, isPatternObject } from "../coloring/color.js";
import { PatternFill } from "../coloring/PatternFill.js";
import { ChartFillType, IPatternObject } from "../coloring/types.js";

const DEFAULT_DISABLED_COLOR = "#CCCCCC";

interface ILegendItemProps {
    item: ISeriesItemMetric;
    index: number;
    width?: number;
    enableBorderRadius?: boolean;
    onItemClick: (item: ISeriesItemMetric) => void;
    theme?: ITheme;
    chartFill?: ChartFillType;
    describedBy?: string;
}

function getPointShapeStyles(
    pointShape: string | undefined,
    iconSize: number,
    enableBorderRadius: boolean,
): CSSProperties {
    if (!pointShape) {
        return { borderRadius: enableBorderRadius ? "50%" : "0" };
    }

    switch (pointShape) {
        case "square":
            return {
                borderRadius: "0", // Square corners
            };
        case "diamond":
            return {
                borderRadius: "0",
                transform: "rotate(45deg)",
                // Adjust size slightly to fit rotated square in same space
                width: `${Math.round(iconSize * 0.7)}px`,
                height: `${Math.round(iconSize * 0.7)}px`,
            };
        case "triangle":
        case "triangle-down":
            return {
                borderRadius: "0",
                width: "0",
                height: "0",
                backgroundColor: "transparent",
            };
        case "circle":
        default:
            return {
                borderRadius: "50%", // Circular
            };
    }
}

function getTrianglePointShapesStyles(
    pointShape: string | undefined,
    chartFill: string | undefined,
    triangleColor: string,
    iconSize: number,
): CSSProperties {
    const isTriangle = pointShape === "triangle" || pointShape === "triangle-down";

    if (!isTriangle) {
        return {};
    }

    const triangleStyles: CSSProperties = {
        width: `${iconSize}px`,
        height: `${iconSize}px`,
    };

    // For pattern and outline fills, we need actual area for content/border
    // Use clip-path method for these cases
    if (chartFill === "pattern" || chartFill === "outline") {
        if (pointShape === "triangle") {
            triangleStyles.clipPath = "polygon(50% 0%, 0% 100%, 100% 100%)";
        } else if (pointShape === "triangle-down") {
            triangleStyles.clipPath = "polygon(0% 0%, 100% 0%, 50% 100%)";
        }
    } else {
        // Use border method for solid fills only - ensure clip-path is reset
        triangleStyles.clipPath = "none";
        if (pointShape === "triangle") {
            triangleStyles.borderLeft = `${iconSize / 2}px solid transparent`;
            triangleStyles.borderRight = `${iconSize / 2}px solid transparent`;
            triangleStyles.borderBottom = `${iconSize}px solid ${triangleColor}`;
            triangleStyles.borderTop = "none";
        } else if (pointShape === "triangle-down") {
            triangleStyles.borderLeft = `${iconSize / 2}px solid transparent`;
            triangleStyles.borderRight = `${iconSize / 2}px solid transparent`;
            triangleStyles.borderTop = `${iconSize}px solid ${triangleColor}`;
            triangleStyles.borderBottom = "none";
        }
    }

    return triangleStyles;
}

function getIconStyle(
    type: string | undefined,
    chartFill: string | undefined,
    color: string | IPatternObject | undefined,
    enableBorderRadius: boolean,
    isVisible?: boolean,
    pointShape?: string,
): CSSProperties {
    // line and bullet target series should always be solid
    const appliedChartFill = type === "line" || type === "bullet" ? "solid" : chartFill;
    // use default color if color is not provided (this should not happen at this stage)
    const baseColor = (isPatternObject(color) ? color.pattern.color : color) ?? DEFAULT_DISABLED_COLOR;

    const iconSize = 9;

    // For triangles, we need special CSS border handling to create the triangle shape
    const isTriangle = pointShape === "triangle" || pointShape === "triangle-down";

    const baseCssProps: CSSProperties = {
        ...getPointShapeStyles(pointShape, iconSize, enableBorderRadius),
        ...getTrianglePointShapesStyles(pointShape, appliedChartFill, baseColor, iconSize),
    };

    switch (appliedChartFill) {
        case "pattern":
            return {
                ...baseCssProps,
                color: baseColor,
                // Don't override triangle borders
                border: isTriangle ? undefined : `1px solid ${baseColor}`,
                position: "relative",
                backgroundColor: isVisible ? "transparent" : baseColor,
            };
        case "outline":
            return {
                ...baseCssProps,
                backgroundColor: baseColor,
                border: isVisible ? `1px solid ${getDarkerColor(baseColor, 0.9)}` : `1px solid ${color}`,
            };
        case "solid":
        default:
            return {
                ...baseCssProps,
                backgroundColor: isTriangle ? "transparent" : baseColor,
            };
    }
}

export const LegendItem = withTheme(function LegendItem({
    item,
    index,
    width,
    enableBorderRadius = false,
    onItemClick,
    theme,
    chartFill,
    describedBy,
}: ILegendItemProps) {
    const { isFocused, id } = LegendSeriesContextStore.useContextStore((ctx) => ({
        isFocused: ctx.focusedItem === item,
        id: ctx.makeItemId(item),
    }));
    const { registerItem } = useItemVisibility();

    const disabledColor = theme?.palette?.complementary?.c5 ?? DEFAULT_DISABLED_COLOR;

    const isPatternFill = chartFill === "pattern" && isPatternObject(item.color);

    const color = item.isVisible ? item.color : disabledColor;
    const iconStyle = getIconStyle(
        item.type,
        chartFill,
        color,
        enableBorderRadius,
        item.isVisible,
        item.pointShape,
    );

    // normal state styled by css
    const nameStyle = item.isVisible
        ? {}
        : {
              color: disabledColor,
          };

    const style = width ? { width: `${width}px` } : {};

    const handleItemClick = () => {
        return onItemClick(item);
    };

    const refCallback = useCallback(
        (element: HTMLButtonElement | null) => {
            if (element) {
                registerItem(index, element);
            } else {
                // Element is unmounted, unregister it
                registerItem(index, null);
            }
        },
        [index, registerItem],
    );

    const legendItemId = useIdPrefixed("legend-item");

    return (
        <button
            ref={refCallback}
            data-testid={"legend-item"}
            role={"switch"}
            aria-describedby={describedBy}
            aria-checked={item.isVisible}
            id={id}
            style={style}
            className={cx("series-item", { "series-item--isFocused": isFocused })}
            onClick={handleItemClick}
            aria-labelledby={legendItemId}
            title={unescape(item.name)}
            tabIndex={-1}
        >
            <div className="series-icon" style={iconStyle}>
                {item.isVisible && isPatternFill && isPatternObject(item.color) ? (
                    <PatternFill patternFill={item.color?.pattern} />
                ) : null}
            </div>
            <div id={legendItemId} className="series-name" style={nameStyle}>
                {item.name}
            </div>
        </button>
    );
});
