// (C) 2019-2025 GoodData Corporation
import React, { memo, useEffect, useRef } from "react";

import cx from "classnames";

import { IColor, IColorFromPalette, IColorPaletteItem, ITheme } from "@gooddata/sdk-model";
import { GD_COLOR_WHITE } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ChartFill, PatternFill, getLighterColor, getPatternFillByIndex } from "@gooddata/sdk-ui-vis-commons";

const ITEM_MARGIN = 5;

export const getIconStyle = (chartFill: ChartFill, baseColor: string, theme: ITheme): React.CSSProperties => {
    if (chartFill === "outline") {
        return {
            backgroundColor: getLighterColor(baseColor, 0.9),
            border: `1px solid ${baseColor}`,
        };
    }
    if (chartFill === "pattern") {
        const backgroundColor =
            theme?.chart?.backgroundColor ?? theme?.palette?.complementary?.c0 ?? GD_COLOR_WHITE;
        return {
            backgroundColor,
            border: `1px solid ${baseColor}`,
            overflow: "hidden",
            position: "relative",
            color: baseColor,
        };
    }
    return {
        backgroundColor: baseColor,
    };
};

export interface IColorPaletteItemProps {
    selected: boolean;
    paletteItem: IColorPaletteItem;
    onColorSelected: (color: IColor) => void;
    chartFill?: ChartFill;
    patternFillIndex?: number;
}

const ColorPaletteItem = memo(function ColorPaletteItem({
    selected,
    paletteItem,
    onColorSelected,
    chartFill = "solid",
    patternFillIndex = 0,
}: IColorPaletteItemProps) {
    const itemRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    useEffect(() => {
        const scrollSelectedItemIntoParent = () => {
            if (selected && itemRef.current?.parentNode && isItemVisible()) {
                const target = itemRef.current;
                const parentNode = target.parentNode as HTMLElement;
                parentNode.scrollTop = target.offsetTop - parentNode.offsetTop - ITEM_MARGIN;
            }
        };

        const isItemVisible = () => {
            const target = itemRef.current;
            if (!target?.parentNode) return false;
            const parentNode = target.parentNode as HTMLElement;
            const offset = target.offsetTop - parentNode.offsetTop;
            const itemHeight = target.clientHeight;
            const parentHeight = parentNode.clientHeight;

            return parentHeight < offset + itemHeight;
        };

        scrollSelectedItemIntoParent();
    }, [selected]);

    const getClassNames = () => {
        return cx("gd-color-list-item", `s-color-list-item-${paletteItem.guid}`, {
            "gd-color-list-item-active": selected,
        });
    };

    const getRgbStringFromPaletteItem = () => {
        const { r, g, b } = paletteItem.fill;
        return `rgb(${r},${g},${b})`;
    };

    const handleColorSelected = () => {
        const selectedItem: IColorFromPalette = {
            type: "guid",
            value: paletteItem.guid,
        };

        onColorSelected(selectedItem);
    };

    const getItemStyle = (): React.CSSProperties => {
        const baseColor = getRgbStringFromPaletteItem();
        return getIconStyle(chartFill, baseColor, theme);
    };
    return (
        <div
            aria-label={getRgbStringFromPaletteItem()}
            ref={itemRef}
            onClick={handleColorSelected}
            style={getItemStyle()}
            className={getClassNames()}
        >
            {chartFill === "pattern" && patternFillIndex >= 0 ? (
                <PatternFill patternFill={getPatternFillByIndex(patternFillIndex)} />
            ) : null}
        </div>
    );
});

export default ColorPaletteItem;
