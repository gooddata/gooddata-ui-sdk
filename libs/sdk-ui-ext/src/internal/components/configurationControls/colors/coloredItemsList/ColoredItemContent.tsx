// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";

import cx from "classnames";

import { IRgbColorValue } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ChartFill, PatternFill, getPatternFillByIndex } from "@gooddata/sdk-ui-vis-commons";

import { ISelectableChild, IconPosition } from "../colorDropdown/ColorDropdown.js";
import { getIconStyle } from "../colorDropdown/ColorPaletteItem.js";

export interface IColoredItemContentProps extends ISelectableChild {
    color: IRgbColorValue;
    chartFill?: ChartFill;
    patternFillIndex?: number;
    text: string;
}

export const ColoredItemContent = memo(function ColoredItemContent({
    color,
    position,
    chartFill = "solid",
    patternFillIndex = 0,
    text,
    isSelected,
    disabled,
}: IColoredItemContentProps) {
    const theme = useTheme();

    const getItemClassNames = () => {
        return cx("gd-list-item gd-color-config-list-item s-colored-items-list-item", {
            "is-active": isSelected && !disabled,
            "is-disabled": disabled,
            "s-is-disabled": disabled,
        });
    };

    const getPreviewBoxClassNames = () => {
        const { r, g, b } = color;
        const isSolidFill = chartFill === "solid";
        return cx("gd-color-config-item-sample", `s-color-${r}-${g}-${b}`, {
            "gd-icon-navigateright": isSolidFill && position == IconPosition.Right,
            "gd-icon-navigatedown": isSolidFill && position === IconPosition.Down,
        });
    };

    const getColorSampleStyle = (): React.CSSProperties => {
        const { r, g, b } = color;
        const baseColor = `rgb(${r},${g},${b})`;
        return getIconStyle(chartFill, baseColor, theme);
    };

    return (
        <div className={getItemClassNames()}>
            <div className={getPreviewBoxClassNames()} style={getColorSampleStyle()}>
                {chartFill === "pattern" && patternFillIndex >= 0 ? (
                    <PatternFill patternFill={getPatternFillByIndex(patternFillIndex)} />
                ) : null}
            </div>
            <span>{text}</span>
        </div>
    );
});

export default ColoredItemContent;
